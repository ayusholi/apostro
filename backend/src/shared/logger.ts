import pino from 'pino';
import { config } from '../config';

/**
 * The one sanctioned logger. Structured JSON in every environment except
 * local dev, where pino-pretty trades structure for readability
 * (INFRASTRUCTURE-DESIGN.md §9).
 *
 * Redaction covers transport-level secrets today. Business-field redaction
 * (clientEmail, clientNotes, tokens in request bodies, …) is added as each
 * feature module introduces those payloads — see ARCHITECTURE.md §10.
 */
export const logger = pino({
  level: config.log.level,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'newPassword',
      'currentPassword',
      'token',
      'accessToken',
      'refreshToken',
    ],
    censor: '[REDACTED]',
  },
  transport: config.app.isDevelopment
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
      }
    : undefined,
});
