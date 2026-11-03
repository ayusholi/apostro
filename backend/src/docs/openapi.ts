import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { registry } from './registry';
import './tenancy.openapi';

const healthStatusSchema = z
  .object({ status: z.enum(['ok', 'unavailable']) })
  .openapi('HealthStatus');

const readinessSchema = z
  .object({
    status: z.enum(['ok', 'unavailable']),
    checks: z.object({ database: z.boolean(), redis: z.boolean() }),
  })
  .openapi('ReadinessStatus');

registry.registerPath({
  method: 'get',
  path: '/health/live',
  tags: ['Health'],
  summary: 'Liveness probe — is the process running?',
  responses: {
    200: {
      description: 'The process is alive.',
      content: { 'application/json': { schema: healthStatusSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/health/ready',
  tags: ['Health'],
  summary: 'Readiness probe — can this instance serve traffic?',
  responses: {
    200: {
      description: 'All dependencies reachable.',
      content: { 'application/json': { schema: readinessSchema } },
    },
    503: {
      description: 'One or more dependencies unreachable.',
      content: { 'application/json': { schema: readinessSchema } },
    },
  },
});

function buildDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'ALLS Solicitors API',
      version: '0.1.0',
      description: 'See backend/API-DESIGN.md for the full designed surface.',
    },
    servers: [{ url: '/api/v1', description: 'Current version' }],
  });
}

// Generated once at module load — the registry is populated at import time
// (by modules like this one), not mutated at request time, so there's
// nothing to gain from recomputing per-request.
const document = buildDocument();

export const docsRouter = Router();

docsRouter.get('/json', (_req, res) => {
  res.json(document);
});

docsRouter.use('/', swaggerUi.serve, swaggerUi.setup(document));
