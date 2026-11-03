import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../validation/validate';
import { requireFirmPermission } from '../tenancy/tenancy.middleware';
import * as controller from './members.controller';
import {
  acceptInvitationSchema,
  createInvitationSchema,
  invitationIdParamSchema,
  listMembersQuerySchema,
  membershipIdParamSchema,
  updateMemberSchema,
} from './members.schema';

/** `/api/v1/firms/:firmId/members` — mounted under firmRouter (tenant verified). */
export const membersRouter = Router({ mergeParams: true });

membersRouter.get(
  '/',
  requireFirmPermission('member:read'),
  validate({ query: listMembersQuerySchema }),
  controller.listMembers,
);
membersRouter.patch(
  '/:membershipId',
  requireFirmPermission('member:manage'),
  validate({ params: membershipIdParamSchema, body: updateMemberSchema }),
  controller.updateMember,
);
membersRouter.delete(
  '/:membershipId',
  requireFirmPermission('member:manage'),
  validate({ params: membershipIdParamSchema }),
  controller.removeMember,
);

/** `/api/v1/firms/:firmId/invitations` — mounted under firmRouter (tenant verified). */
export const firmInvitationsRouter = Router({ mergeParams: true });

firmInvitationsRouter.use(requireFirmPermission('member:manage'));

firmInvitationsRouter.get('/', controller.listInvitations);
firmInvitationsRouter.post(
  '/',
  validate({ body: createInvitationSchema }),
  controller.createInvitation,
);
firmInvitationsRouter.delete(
  '/:invitationId',
  validate({ params: invitationIdParamSchema }),
  controller.revokeInvitation,
);

/**
 * `/api/v1/invitations` — the invitee's side. Not under `/firms/:firmId`:
 * the caller isn't a member until this succeeds. The token travels in the
 * body, never the URL, so it stays out of access logs.
 */
export const invitationsRouter = Router();

invitationsRouter.post(
  '/accept',
  authenticate({ allow: ['staff'] }),
  validate({ body: acceptInvitationSchema }),
  controller.acceptInvitation,
);
