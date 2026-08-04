// Must run first: patches `.openapi()` onto Zod before any schema uses it.
import './docs/registry';

import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';

import { config } from './config';
import { logger } from './shared/logger';
import { requestId } from './middleware/requestId';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import { docsRouter } from './docs/openapi';
import { healthRouter } from './health/health.routes';
import { v1Router } from './routes/v1';

const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    // No Origin header = same-origin, curl, or server-to-server — allow.
    // Otherwise: exact-origin allowlist only, never a wildcard
    // (ARCHITECTURE.md §13).
    if (!origin || config.security.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
};

/**
 * Builds a fully configured Express app *without* listening — so tests can
 * import it directly (via supertest) and server.ts is the only place that
 * binds a port (FOLDER-STRUCTURE.md §2).
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', config.security.trustProxy);

  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as unknown as { id: string }).id,
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }),
  );

  // Swagger UI renders an HTML page with inline scripts/styles that a
  // strict CSP blocks. It gets its own relaxed chain and fully handles
  // (terminates) its own request path, before the strict helmet() below
  // ever applies to it.
  app.use('/docs', helmet({ contentSecurityPolicy: false }), docsRouter);

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  // No signing secret: the refresh token itself is already an opaque,
  // CSPRNG value hashed at rest (shared/crypto.ts) — cookie signing would
  // be redundant, not an additional guarantee.
  app.use(cookieParser());

  app.use('/health', healthRouter);
  app.use('/api/v1', v1Router);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
