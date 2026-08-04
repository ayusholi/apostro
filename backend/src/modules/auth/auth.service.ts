import type { User } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { redis } from '../../db/redis';
import { AppError } from '../../shared/errors';
import { logger } from '../../shared/logger';
import { signAccessToken } from '../../shared/jwt';
import { config } from '../../config';
import { sha256Hex, generateOpaqueToken } from '../../shared/crypto';
import { assertNever } from '../../shared/utils';
import * as repo from './auth.repository';
import { hashPassword, verifyPassword } from './password';
import { getEmailSender } from './ports';
import type { LoginInput, RegisterInput } from './auth.schema';
import {
  REFRESH_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_REMEMBER_ME_SECONDS,
  EMAIL_VERIFICATION_TTL_SECONDS,
  PASSWORD_RESET_TTL_SECONDS,
  LOGIN_MAX_ATTEMPTS,
  LOGIN_ATTEMPT_WINDOW_SECONDS,
  LOGIN_LOCKOUT_SECONDS,
} from './auth.constants';

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  status: User['status'];
  emailVerifiedAt: Date | null;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

export interface SessionSummary {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  rememberMe: boolean;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
  };
}

function sessionRedisKey(sessionId: string): string {
  return `session:${sessionId}`;
}

// ── Session + token issuance (the part login and refresh share) ────────────

async function createSessionRecord(
  userId: string,
  rememberMe: boolean,
  ctx: RequestContext,
): Promise<{ sessionId: string; expiresAt: Date }> {
  const ttlSeconds = rememberMe ? REFRESH_TOKEN_TTL_REMEMBER_ME_SECONDS : REFRESH_TOKEN_TTL_SECONDS;
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  const session = await repo.createSession({
    userId,
    rememberMe,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    expiresAt,
  });

  // The Redis key IS the revocation allowlist `authenticate` checks
  // (AUTH-DESIGN.md §3.3, §7.1) — without this, a freshly-issued access
  // token would fail its very first request.
  await redis.set(
    sessionRedisKey(session.id),
    JSON.stringify({ userId, rememberMe, createdAt: session.createdAt.toISOString() }),
    'EX',
    ttlSeconds,
  );

  return { sessionId: session.id, expiresAt };
}

async function issueTokenPair(
  userId: string,
  sessionId: string,
  sessionExpiresAt: Date,
  familyId: string,
  parentId?: string,
): Promise<AuthTokens> {
  const rawRefreshToken = generateOpaqueToken();

  await repo.createRefreshToken({
    sessionId,
    userId,
    tokenHash: sha256Hex(rawRefreshToken),
    familyId,
    parentId,
    expiresAt: sessionExpiresAt, // a refresh token never outlives its session
  });

  const accessToken = signAccessToken({ sub: userId, typ: 'staff', sid: sessionId });

  return {
    accessToken,
    accessTokenExpiresIn: config.jwt.accessTokenTtlSeconds,
    refreshToken: rawRefreshToken,
    refreshTokenExpiresAt: sessionExpiresAt,
  };
}

/** Revokes a session's DB row, its unconsumed refresh tokens, and — critically — its Redis allowlist key, so revocation is immediate rather than waiting for the access token to expire. */
async function revokeSessionEverywhere(sessionId: string, reason: string): Promise<void> {
  await Promise.all([
    repo.revokeSession(sessionId, reason),
    repo.revokeRefreshTokensForSession(sessionId, reason),
    redis.del(sessionRedisKey(sessionId)),
  ]);
}

// ── Register ─────────────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<{ user: SafeUser }> {
  const existing = await repo.findUserByEmail(input.email);
  if (existing) {
    // Unlike login/forgot-password, revealing "this email is already
    // registered" at register time is standard, expected UX and not the
    // same enumeration risk (AUTH-DESIGN.md §4.1/§6.2's uniform-response
    // rule protects *guessing whether an account exists to attack it* —
    // an attacker learning an email is taken doesn't help them log in).
    throw new AppError({
      status: 409,
      code: 'EMAIL_ALREADY_EXISTS',
      detail: 'An account with this email already exists.',
    });
  }

  const passwordHash = await hashPassword(input.password);
  const user = await repo.createUser({
    email: input.email,
    passwordHash,
    fullName: input.fullName,
  });

  await sendEmailVerification(user);

  return { user: toSafeUser(user) };
}

async function sendEmailVerification(user: User): Promise<void> {
  await repo.invalidateOutstandingVerificationTokens(user.id, 'EMAIL_VERIFY');
  const rawToken = generateOpaqueToken();
  await repo.createVerificationToken({
    userId: user.id,
    purpose: 'EMAIL_VERIFY',
    tokenHash: sha256Hex(rawToken),
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_SECONDS * 1000),
  });

  await getEmailSender()({
    to: user.email,
    template: 'email-verify',
    data: { token: rawToken, fullName: user.fullName },
  });
}

// ── Login throttling (AUTH-DESIGN.md §6.4) ──────────────────────────────────
//
// Deliberately lean and scoped to this one endpoint — the general,
// Redis-backed, multi-tier rate limiter (per-route + per-IP + per-account)
// is separate infrastructure (INFRASTRUCTURE-DESIGN.md §12) sized on its
// own. Shipping Login with *zero* brute-force protection until that lands
// is not an acceptable gap, so this is the minimum that closes it: a
// per-account failure counter and a lockout, both keyed off a hash of the
// email (never plaintext, so a Redis dump doesn't enumerate attempted
// accounts) — not a per-IP limit, which the general limiter will add.

function throttleKey(prefix: string, email: string): string {
  return `authThrottle:${prefix}:${sha256Hex(email)}`;
}

async function assertNotLockedOut(email: string): Promise<void> {
  const locked = await redis.exists(throttleKey('lock', email));
  if (locked) {
    throw new AppError({
      status: 423,
      code: 'ACCOUNT_LOCKED',
      detail: 'Too many failed login attempts. Try again later.',
    });
  }
}

async function recordLoginFailure(email: string): Promise<void> {
  const attemptsKey = throttleKey('attempts', email);
  const attempts = await redis.incr(attemptsKey);
  if (attempts === 1) {
    await redis.expire(attemptsKey, LOGIN_ATTEMPT_WINDOW_SECONDS);
  }
  if (attempts >= LOGIN_MAX_ATTEMPTS) {
    await redis.set(throttleKey('lock', email), '1', 'EX', LOGIN_LOCKOUT_SECONDS);
  }
}

async function clearLoginThrottle(email: string): Promise<void> {
  await redis.del(throttleKey('attempts', email), throttleKey('lock', email));
}

// ── Login ────────────────────────────────────────────────────────────────

export async function login(
  input: LoginInput,
  ctx: RequestContext,
): Promise<{ tokens: AuthTokens; user: SafeUser }> {
  await assertNotLockedOut(input.email);

  const user = await repo.findUserByEmail(input.email);

  // Same failure, same status/code, whether the account doesn't exist or
  // the password is wrong (AUTH-DESIGN.md §4.2) — an attacker probing
  // emails must not be able to tell which case they hit.
  const invalidCredentials = () =>
    new AppError({
      status: 401,
      code: 'INVALID_CREDENTIALS',
      detail: 'Incorrect email or password.',
    });

  if (!user) {
    await recordLoginFailure(input.email);
    throw invalidCredentials();
  }

  const passwordOk = await verifyPassword(user.passwordHash, input.password);
  if (!passwordOk) {
    await recordLoginFailure(input.email);
    throw invalidCredentials();
  }

  await clearLoginThrottle(input.email);

  // Past this point the caller has proven they hold the password, so a
  // specific reason for refusal no longer leaks anything an attacker
  // couldn't already infer from a correct guess.
  switch (user.status) {
    case 'ACTIVE':
      break;
    case 'INVITED':
      throw new AppError({
        status: 403,
        code: 'EMAIL_NOT_VERIFIED',
        detail: 'Please verify your email before logging in.',
      });
    case 'SUSPENDED':
      throw new AppError({
        status: 403,
        code: 'ACCOUNT_SUSPENDED',
        detail: 'This account is suspended.',
      });
    case 'DISABLED':
      throw new AppError({
        status: 403,
        code: 'ACCOUNT_DISABLED',
        detail: 'This account is disabled.',
      });
    default:
      assertNever(user.status, 'Unhandled UserStatus');
  }

  const { sessionId, expiresAt } = await createSessionRecord(user.id, input.rememberMe, ctx);
  const tokens = await issueTokenPair(user.id, sessionId, expiresAt, randomUUID());

  await repo.touchLastLogin(user.id);
  logger.info({ userId: user.id, sessionId }, 'User logged in');

  return { tokens, user: toSafeUser(user) };
}

// ── Refresh ──────────────────────────────────────────────────────────────

export async function refresh(rawToken: string | undefined): Promise<AuthTokens> {
  if (!rawToken) {
    throw AppError.unauthenticated('Missing refresh token.');
  }

  const tokenHash = sha256Hex(rawToken);
  const existing = await repo.findRefreshTokenByHash(tokenHash);
  if (!existing) {
    throw AppError.unauthenticated('Refresh token is invalid.');
  }

  const session = await repo.findActiveSessionById(existing.sessionId);
  if (!session) {
    throw AppError.unauthenticated('Session has been revoked.');
  }

  // Generated up front so its real hash goes into the atomic claim-and-
  // create transaction directly — no placeholder, no follow-up write.
  const rawNewToken = generateOpaqueToken();

  const result = await repo.rotateRefreshToken({
    oldTokenId: existing.id,
    sessionId: existing.sessionId,
    userId: existing.userId,
    familyId: existing.familyId,
    newTokenHash: sha256Hex(rawNewToken),
    newExpiresAt: session.expiresAt,
  });

  if (!result.rotated) {
    if (result.reason === 'REUSE_DETECTED') {
      // A refresh token that's already been exchanged is being presented
      // again — the legitimate client always holds the *newest* token in
      // the chain, so this can only mean the token was copied (stolen).
      // The correct response is to burn the entire lineage and the
      // session it belongs to, not just this one token (AUTH-DESIGN.md §3.2).
      logger.warn(
        { userId: existing.userId, sessionId: existing.sessionId, familyId: existing.familyId },
        'Refresh token reuse detected — revoking token family and session',
      );
      await Promise.all([
        repo.revokeRefreshTokenFamily(existing.familyId, 'REUSE_DETECTED'),
        revokeSessionEverywhere(existing.sessionId, 'REUSE_DETECTED'),
      ]);
    }
    throw AppError.unauthenticated('Refresh token is invalid or has expired.');
  }

  await repo.touchSessionLastSeen(session.id);

  const accessToken = signAccessToken({ sub: existing.userId, typ: 'staff', sid: session.id });

  return {
    accessToken,
    accessTokenExpiresIn: config.jwt.accessTokenTtlSeconds,
    refreshToken: rawNewToken,
    refreshTokenExpiresAt: session.expiresAt,
  };
}

// ── Logout ───────────────────────────────────────────────────────────────

export async function logout(sessionId: string): Promise<void> {
  await revokeSessionEverywhere(sessionId, 'LOGOUT');
}

// ── Me ───────────────────────────────────────────────────────────────────

export async function getMe(userId: string): Promise<SafeUser> {
  const user = await repo.findUserById(userId);
  if (!user) {
    throw AppError.notFound('User not found.');
  }
  return toSafeUser(user);
}

// ── Email verification ──────────────────────────────────────────────────

export async function requestEmailVerification(email: string): Promise<void> {
  const user = await repo.findUserByEmail(email);
  // Uniform response regardless of whether the account exists or is
  // already verified — same anti-enumeration rationale as password reset.
  if (user && !user.emailVerifiedAt) {
    await sendEmailVerification(user);
  }
}

export async function verifyEmail(rawToken: string): Promise<void> {
  const record = await repo.findValidVerificationToken(sha256Hex(rawToken), 'EMAIL_VERIFY');
  if (!record) {
    throw new AppError({
      status: 400,
      code: 'INVALID_OR_EXPIRED_TOKEN',
      detail: 'This verification link is invalid or has expired.',
    });
  }

  await repo.consumeVerificationToken(record.id);
  await repo.markEmailVerified(record.userId);
}

// ── Password reset ───────────────────────────────────────────────────────

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await repo.findUserByEmail(email);
  // Always 202 from the controller regardless of what happens here — never
  // reveal whether the address is registered (AUTH-DESIGN.md §6.2).
  if (!user) return;

  await repo.invalidateOutstandingVerificationTokens(user.id, 'PASSWORD_RESET');
  const rawToken = generateOpaqueToken();
  await repo.createVerificationToken({
    userId: user.id,
    purpose: 'PASSWORD_RESET',
    tokenHash: sha256Hex(rawToken),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000),
  });

  await getEmailSender()({
    to: user.email,
    template: 'password-reset',
    data: { token: rawToken, fullName: user.fullName },
  });
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const record = await repo.findValidVerificationToken(sha256Hex(rawToken), 'PASSWORD_RESET');
  if (!record) {
    throw new AppError({
      status: 400,
      code: 'INVALID_OR_EXPIRED_TOKEN',
      detail: 'This password reset link is invalid or has expired.',
    });
  }

  await repo.consumeVerificationToken(record.id);
  const passwordHash = await hashPassword(newPassword);
  await repo.updatePasswordHash(record.userId, passwordHash);

  // A password reset is exactly the moment you want every existing
  // session killed — the account may already be compromised, and the
  // person completing the reset has just proven ownership via email
  // (AUTH-DESIGN.md §6.2, §6.6).
  const revokedSessionIds = await repo.revokeAllSessionsForUser(record.userId, 'PASSWORD_RESET');
  await Promise.all([
    ...revokedSessionIds.map((id) => redis.del(sessionRedisKey(id))),
    ...revokedSessionIds.map((id) => repo.revokeRefreshTokensForSession(id, 'PASSWORD_RESET')),
  ]);

  logger.info(
    { userId: record.userId, revokedSessions: revokedSessionIds.length },
    'Password reset — all sessions revoked',
  );
}

// ── Session management ───────────────────────────────────────────────────

export async function listSessions(
  userId: string,
  currentSessionId: string,
): Promise<SessionSummary[]> {
  const sessions = await repo.listActiveSessionsForUser(userId);
  return sessions.map((session) => ({
    id: session.id,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    rememberMe: session.rememberMe,
    createdAt: session.createdAt,
    lastSeenAt: session.lastSeenAt,
    expiresAt: session.expiresAt,
    isCurrent: session.id === currentSessionId,
  }));
}

export async function revokeOwnSession(userId: string, sessionId: string): Promise<void> {
  const session = await repo.findActiveSessionById(sessionId);
  // Uniform 404 whether the session doesn't exist or belongs to someone
  // else — never confirm another user's session id is valid (API-DESIGN.md
  // §0.5 / AUTH-DESIGN.md §5's "never distinguish missing from not yours").
  if (!session || session.userId !== userId) {
    throw AppError.notFound('Session not found.');
  }
  await revokeSessionEverywhere(sessionId, 'USER_REVOKED');
}

export async function revokeAllOtherSessions(
  userId: string,
  currentSessionId: string,
): Promise<number> {
  const revokedSessionIds = await repo.revokeAllSessionsForUser(
    userId,
    'USER_REVOKED_ALL',
    currentSessionId,
  );
  await Promise.all([
    ...revokedSessionIds.map((id) => redis.del(sessionRedisKey(id))),
    ...revokedSessionIds.map((id) => repo.revokeRefreshTokensForSession(id, 'USER_REVOKED_ALL')),
  ]);
  return revokedSessionIds.length;
}
