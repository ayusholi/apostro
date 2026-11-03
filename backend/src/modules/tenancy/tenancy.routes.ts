import { Router, type Request, type Response } from 'express';
import { prisma } from '../../db/prisma';
import { authenticate } from '../../middleware/authenticate';
import { AppError } from '../../shared/errors';
import { sendOk } from '../../shared/response';
import { clientsRouter } from '../clients/clients.routes';
import { mattersRouter } from '../matters/matters.routes';
import { tasksRouter } from '../tasks/tasks.routes';
import { getTenant, resolveTenant } from './tenancy.middleware';
import { listActiveMemberships } from './tenancy.repository';

/** `/api/v1/me` — the signed-in user's own, firm-independent views. */
export const meRouter = Router();

meRouter.use(authenticate({ allow: ['staff'] }));

meRouter.get('/firms', async (req: Request, res: Response) => {
  const memberships = await listActiveMemberships(req.principal!.id);
  sendOk(res, {
    data: memberships.map((m) => ({ membershipId: m.id, role: m.role, firm: m.firm })),
  });
});

/**
 * `/api/v1/firms/:firmId` — the tenant boundary. Everything mounted under
 * this router runs with a verified TenantContext (ADR-002); the order
 * authenticate → resolveTenant is fixed here once, so no feature route can
 * forget it.
 */
export const firmRouter = Router({ mergeParams: true });

firmRouter.use(authenticate({ allow: ['staff'] }), resolveTenant());

firmRouter.get('/', async (req: Request, res: Response) => {
  const tenant = getTenant(req);
  // Firm isn't a tenant-owned model (it *is* the tenant), so it's read by
  // the verified id from context — never from the request.
  const firm = await prisma.firm.findUnique({
    where: { id: tenant.firmId },
    select: { id: true, name: true, slug: true },
  });
  if (!firm) throw AppError.notFound('Firm not found.');
  sendOk(res, { ...firm, membership: { id: tenant.membershipId, role: tenant.role } });
});

firmRouter.use('/clients', clientsRouter);
firmRouter.use('/matters', mattersRouter);
firmRouter.use('/tasks', tasksRouter);
