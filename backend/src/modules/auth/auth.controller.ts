import type { CookieOptions, Request, Response } from 'express';
import { config } from '../../config';
import { AppError } from '../../shared/errors';
import { sendAccepted, sendCreated, sendNoContent, sendOk } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import * as authService from './auth.service';
import type {
  LoginInput,
  RegisterInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from './auth.schema';
import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from './auth.constants';
import type { AuthTokens } from './auth.service';

function requestContext(req: Request) {
  return { ipAddress: req.ip, userAgent: req.header('user-agent') };
}

function refreshCookieOptions(expiresAt: Date): CookieOptions {
  return {
    httpOnly: true,
    // Secure requires HTTPS; only enforced outside local dev, or every
    // request would be silently dropped over plain HTTP (AUTH-DESIGN.md §2.2).
    secure: config.app.isProduction,
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    expires: expiresAt,
  };
}

/** Sets the refresh cookie and returns only what belongs in the JSON body — the raw refresh token is never returned there (AUTH-DESIGN.md §2.2). */
function respondWithTokens(res: Response, tokens: AuthTokens, extra: Record<string, unknown> = {}) {
  res.cookie(
    REFRESH_COOKIE_NAME,
    tokens.refreshToken,
    refreshCookieOptions(tokens.refreshTokenExpiresAt),
  );
  return { accessToken: tokens.accessToken, expiresIn: tokens.accessTokenExpiresIn, ...extra };
}

export async function register(req: Request, res: Response): Promise<void> {
  const input = getValidated<RegisterInput>(req, 'body');
  const { user } = await authService.register(input);
  sendCreated(res, { user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = getValidated<LoginInput>(req, 'body');
  const { tokens, user } = await authService.login(input, requestContext(req));
  sendOk(res, respondWithTokens(res, tokens, { user }));
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const rawToken: unknown = req.cookies?.[REFRESH_COOKIE_NAME];
  const tokens = await authService.refresh(typeof rawToken === 'string' ? rawToken : undefined);
  sendOk(res, respondWithTokens(res, tokens));
}

export async function logout(req: Request, res: Response): Promise<void> {
  if (req.principal) {
    await authService.logout(req.principal.sid);
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
  sendNoContent(res);
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.principal) {
    throw AppError.unauthenticated();
  }
  const user = await authService.getMe(req.principal.id);
  sendOk(res, user);
}

export async function requestEmailVerification(req: Request, res: Response): Promise<void> {
  const { email } = getValidated<RequestPasswordResetInput>(req, 'body');
  await authService.requestEmailVerification(email);
  sendAccepted(res);
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = getValidated<VerifyEmailInput>(req, 'body');
  await authService.verifyEmail(token);
  sendNoContent(res);
}

export async function requestPasswordReset(req: Request, res: Response): Promise<void> {
  const { email } = getValidated<RequestPasswordResetInput>(req, 'body');
  await authService.requestPasswordReset(email);
  // Always 202, regardless of what happened — never confirm or deny that
  // the address is registered (AUTH-DESIGN.md §6.2).
  sendAccepted(res);
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = getValidated<ResetPasswordInput>(req, 'body');
  await authService.resetPassword(token, newPassword);
  sendNoContent(res);
}

export async function listSessions(req: Request, res: Response): Promise<void> {
  if (!req.principal) throw AppError.unauthenticated();
  const sessions = await authService.listSessions(req.principal.id, req.principal.sid);
  sendOk(res, sessions);
}

export async function revokeSession(req: Request, res: Response): Promise<void> {
  if (!req.principal) throw AppError.unauthenticated();
  const { sessionId } = getValidated<{ sessionId: string }>(req, 'params');
  await authService.revokeOwnSession(req.principal.id, sessionId);
  sendNoContent(res);
}

export async function revokeAllOtherSessions(req: Request, res: Response): Promise<void> {
  if (!req.principal) throw AppError.unauthenticated();
  const revoked = await authService.revokeAllOtherSessions(req.principal.id, req.principal.sid);
  sendOk(res, { revoked });
}
