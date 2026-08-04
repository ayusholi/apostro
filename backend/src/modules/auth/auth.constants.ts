/**
 * Token/session lifetimes (AUTH-DESIGN.md §2, §6.1–§6.3). Design decisions,
 * not deployment config — unlike `config.jwt.accessTokenTtlSeconds`
 * (env-driven, since access-token TTL is the revocation-lag ceiling an
 * operator might reasonably want to tune), these are fixed by the auth
 * model itself.
 */
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
export const REFRESH_TOKEN_TTL_REMEMBER_ME_SECONDS = 30 * 24 * 60 * 60; // 30 days
export const EMAIL_VERIFICATION_TTL_SECONDS = 24 * 60 * 60; // 24 hours
export const PASSWORD_RESET_TTL_SECONDS = 60 * 60; // 1 hour

/** Login throttling (AUTH-DESIGN.md §6.4) — a lean, module-local control. */
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60;
export const LOGIN_LOCKOUT_SECONDS = 15 * 60;

export const REFRESH_COOKIE_NAME = 'refreshToken';
/** Path-scoped so the cookie is sent only to the one route that consumes it (AUTH-DESIGN.md §2.2). */
export const REFRESH_COOKIE_PATH = '/api/v1/auth/refresh';
