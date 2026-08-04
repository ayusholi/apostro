import type { RefreshToken, Session, User, VerificationPurpose } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../db/prisma';

// ── Users ──────────────────────────────────────────────────────────────────

export function createUser(input: {
  email: string;
  passwordHash: string;
  fullName: string;
}): Promise<User> {
  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash: input.passwordHash,
      fullName: input.fullName,
    },
  });
}

/** `email` must already be normalized (lowercased/trimmed) by the caller — see auth.schema.ts. */
export function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findFirst({ where: { email, deletedAt: null } });
}

export function findUserById(id: string): Promise<User | null> {
  return prisma.user.findFirst({ where: { id, deletedAt: null } });
}

export function markEmailVerified(userId: string): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { emailVerifiedAt: new Date(), status: 'ACTIVE' },
  });
}

export function updatePasswordHash(userId: string, passwordHash: string): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash, passwordChangedAt: new Date() },
  });
}

export function touchLastLogin(userId: string): Promise<User> {
  return prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
}

// ── Sessions ───────────────────────────────────────────────────────────────

export function createSession(input: {
  userId: string;
  rememberMe: boolean;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
}): Promise<Session> {
  return prisma.session.create({
    data: {
      userId: input.userId,
      rememberMe: input.rememberMe,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      expiresAt: input.expiresAt,
    },
  });
}

export function findActiveSessionById(id: string): Promise<Session | null> {
  return prisma.session.findFirst({ where: { id, revokedAt: null } });
}

export function touchSessionLastSeen(id: string): Promise<Session> {
  return prisma.session.update({ where: { id }, data: { lastSeenAt: new Date() } });
}

export function listActiveSessionsForUser(userId: string): Promise<Session[]> {
  return prisma.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { lastSeenAt: 'desc' },
  });
}

export function revokeSession(id: string, reason: string): Promise<Session> {
  return prisma.session.update({
    where: { id },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
}

/** Used by password reset and "log out everywhere" (AUTH-DESIGN.md §6.2, §6.6). */
export async function revokeAllSessionsForUser(
  userId: string,
  reason: string,
  exceptSessionId?: string,
): Promise<string[]> {
  const sessions = await prisma.session.findMany({
    where: { userId, revokedAt: null, id: exceptSessionId ? { not: exceptSessionId } : undefined },
    select: { id: true },
  });

  await prisma.session.updateMany({
    where: { id: { in: sessions.map((s) => s.id) } },
    data: { revokedAt: new Date(), revokedReason: reason },
  });

  return sessions.map((s) => s.id);
}

// ── Refresh tokens ─────────────────────────────────────────────────────────

export function createRefreshToken(input: {
  sessionId: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  parentId?: string;
  expiresAt: Date;
}): Promise<RefreshToken> {
  return prisma.refreshToken.create({
    data: {
      sessionId: input.sessionId,
      userId: input.userId,
      tokenHash: input.tokenHash,
      familyId: input.familyId,
      parentId: input.parentId,
      expiresAt: input.expiresAt,
    },
  });
}

export function findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
  return prisma.refreshToken.findUnique({ where: { tokenHash } });
}

export type RotateResult =
  | { rotated: true; token: RefreshToken }
  | { rotated: false; reason: 'NOT_FOUND' | 'REUSE_DETECTED' | 'EXPIRED' };

/**
 * Atomically consumes `oldTokenId` and issues its successor in the same
 * family, or reports why it couldn't. The claim is a conditional
 * `updateMany` (`WHERE id = ? AND consumedAt IS NULL AND revokedAt IS
 * NULL`), not a read-then-write — the same "claim before acting" pattern
 * BOOKING-DESIGN.md uses for reminders, and for the same reason: under
 * READ COMMITTED, two concurrent requests presenting the *same* token
 * could otherwise both read "not yet consumed" and both succeed. A
 * conditional UPDATE is atomic; only one caller's `count` comes back 1.
 *
 * `count === 0` on an existing row — whether consumed a millisecond ago by
 * a genuine race or days ago by a stolen token being replayed — is,
 * deliberately, the *same* signal: reuse of a token that's already been
 * exchanged. The caller (auth.service.ts) responds to both identically —
 * revoke the whole family — because the security posture is identical
 * either way (AUTH-DESIGN.md §3.2).
 */
export async function rotateRefreshToken(input: {
  oldTokenId: string;
  sessionId: string;
  userId: string;
  familyId: string;
  newTokenHash: string;
  newExpiresAt: Date;
}): Promise<RotateResult> {
  return prisma.$transaction(async (tx) => {
    const claim = await tx.refreshToken.updateMany({
      where: { id: input.oldTokenId, consumedAt: null, revokedAt: null },
      data: { consumedAt: new Date() },
    });

    if (claim.count === 0) {
      const existing = await tx.refreshToken.findUnique({ where: { id: input.oldTokenId } });
      if (!existing) {
        return { rotated: false, reason: 'NOT_FOUND' };
      }
      if (existing.expiresAt < new Date() && !existing.consumedAt && !existing.revokedAt) {
        return { rotated: false, reason: 'EXPIRED' };
      }
      return { rotated: false, reason: 'REUSE_DETECTED' };
    }

    const token = await tx.refreshToken.create({
      data: {
        id: randomUUID(),
        sessionId: input.sessionId,
        userId: input.userId,
        tokenHash: input.newTokenHash,
        familyId: input.familyId,
        parentId: input.oldTokenId,
        expiresAt: input.newExpiresAt,
      },
    });

    return { rotated: true, token };
  });
}

/** The theft response: presenting a consumed token invalidates every token in its lineage (AUTH-DESIGN.md §3.2). */
export function revokeRefreshTokenFamily(
  familyId: string,
  reason: string,
): Promise<{ count: number }> {
  return prisma.refreshToken.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
}

export function revokeRefreshTokensForSession(
  sessionId: string,
  reason: string,
): Promise<{ count: number }> {
  return prisma.refreshToken.updateMany({
    where: { sessionId, revokedAt: null, consumedAt: null },
    data: { revokedAt: new Date(), revokedReason: reason },
  });
}

// ── Verification tokens (email verify + password reset) ────────────────────

export function createVerificationToken(input: {
  userId: string;
  purpose: VerificationPurpose;
  tokenHash: string;
  expiresAt: Date;
  ipAddress?: string;
}) {
  return prisma.verificationToken.create({
    data: {
      userId: input.userId,
      purpose: input.purpose,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      ipAddress: input.ipAddress,
    },
  });
}

export function findValidVerificationToken(tokenHash: string, purpose: VerificationPurpose) {
  return prisma.verificationToken.findFirst({
    where: { tokenHash, purpose, consumedAt: null, expiresAt: { gt: new Date() } },
  });
}

export function consumeVerificationToken(id: string) {
  return prisma.verificationToken.update({ where: { id }, data: { consumedAt: new Date() } });
}

/** Invalidates any outstanding (unconsumed) tokens of this purpose before issuing a new one — at most one live reset/verify link per user at a time. */
export function invalidateOutstandingVerificationTokens(
  userId: string,
  purpose: VerificationPurpose,
): Promise<{ count: number }> {
  return prisma.verificationToken.updateMany({
    where: { userId, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });
}
