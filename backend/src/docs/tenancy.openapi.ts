import { z } from 'zod';
import { createTaskSchema, taskIdParamSchema } from '../modules/tasks/tasks.schema';
import { clientIdParamSchema, listClientsQuerySchema } from '../modules/clients/clients.schema';
import {
  listActivityQuerySchema,
  listMatterTasksQuerySchema,
  matterIdParamSchema,
} from '../modules/matters/matters.schema';
import { createFirmSchema } from '../modules/firms/firms.schema';
import {
  acceptInvitationSchema,
  createInvitationSchema,
  invitationIdParamSchema,
  listMembersQuerySchema,
  membershipIdParamSchema,
  updateMemberSchema,
} from '../modules/members/members.schema';
import { registry } from './registry';

/**
 * OpenAPI for the multi-tenant surface (ADR-002): `/me` and
 * `/firms/:firmId/...`. Request schemas are the same Zod objects the routes
 * validate with, so they cannot drift; response bodies are described
 * loosely and tightened as the contracts settle.
 */

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

const security = [{ bearerAuth: [] }];
const firmIdParam = z.object({ firmId: z.string().uuid() });

const problemSchema = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.number().int(),
    code: z.string(),
    detail: z.string().optional(),
    traceId: z.string().optional(),
  })
  .openapi('Problem');

const problem = (description: string) => ({
  description,
  content: { 'application/problem+json': { schema: problemSchema } },
});

const json = (description: string, schema: z.ZodTypeAny) => ({
  description,
  content: { 'application/json': { schema } },
});

const objectResponse = (name: string) =>
  z
    .object({})
    .passthrough()
    .openapi(name, { description: `A ${name.toLowerCase()} record.` });

const listResponse = (name: string) =>
  z.object({ data: z.array(z.object({}).passthrough()) }).openapi(name);

const pageInfoSchema = z.object({ nextCursor: z.string().nullable(), hasNextPage: z.boolean() });

const tenantErrors = {
  401: problem('Missing or invalid access token.'),
  403: problem('The role in this firm lacks the required permission.'),
  404: problem('Not found — also returned when the caller is not a member of the firm.'),
};

registry.registerPath({
  method: 'get',
  path: '/me/firms',
  tags: ['Tenancy'],
  summary: 'Firms the signed-in user is an active member of.',
  security,
  responses: {
    200: json('Active memberships.', listResponse('MyFirms')),
    401: tenantErrors[401],
  },
});

registry.registerPath({
  method: 'get',
  path: '/firms/{firmId}',
  tags: ['Tenancy'],
  summary: 'The firm and the caller’s membership in it.',
  security,
  request: { params: firmIdParam },
  responses: { 200: json('The firm.', objectResponse('Firm')), ...tenantErrors },
});

registry.registerPath({
  method: 'get',
  path: '/firms/{firmId}/clients',
  tags: ['Clients'],
  summary: 'List clients (cursor-paginated). Requires client:read.',
  security,
  request: { params: firmIdParam, query: listClientsQuerySchema },
  responses: {
    200: json(
      'A page of clients.',
      z
        .object({ data: z.array(z.object({}).passthrough()), pageInfo: pageInfoSchema })
        .openapi('ClientPage'),
    ),
    ...tenantErrors,
  },
});

registry.registerPath({
  method: 'get',
  path: '/firms/{firmId}/clients/{clientId}',
  tags: ['Clients'],
  summary: 'Get one client. Requires client:read.',
  security,
  request: { params: firmIdParam.merge(clientIdParamSchema) },
  responses: { 200: json('The client.', objectResponse('Client')), ...tenantErrors },
});

registry.registerPath({
  method: 'get',
  path: '/firms/{firmId}/matters/{matterId}',
  tags: ['Matters'],
  summary: 'Get one matter. Requires matter:read.',
  security,
  request: { params: firmIdParam.merge(matterIdParamSchema) },
  responses: { 200: json('The matter.', objectResponse('Matter')), ...tenantErrors },
});

registry.registerPath({
  method: 'get',
  path: '/firms/{firmId}/matters/{matterId}/tasks',
  tags: ['Matters'],
  summary: 'Tasks on a matter. Requires matter:read and task:read.',
  security,
  request: { params: firmIdParam.merge(matterIdParamSchema), query: listMatterTasksQuerySchema },
  responses: { 200: json('Tasks.', listResponse('TaskList')), ...tenantErrors },
});

registry.registerPath({
  method: 'get',
  path: '/firms/{firmId}/matters/{matterId}/activity',
  tags: ['Matters'],
  summary: 'Recent activity on a matter. Requires matter:read.',
  security,
  request: { params: firmIdParam.merge(matterIdParamSchema), query: listActivityQuerySchema },
  responses: { 200: json('Activity events.', listResponse('ActivityList')), ...tenantErrors },
});

registry.registerPath({
  method: 'post',
  path: '/firms/{firmId}/tasks',
  tags: ['Tasks'],
  summary: 'Create a task. Requires task:write. A body firmId is rejected.',
  security,
  request: {
    params: firmIdParam,
    body: { required: true, content: { 'application/json': { schema: createTaskSchema } } },
  },
  responses: {
    201: json('The created task.', objectResponse('Task')),
    422: problem('Validation failed, or a referenced matter/client/assignee is not in this firm.'),
    ...tenantErrors,
  },
});

registry.registerPath({
  method: 'post',
  path: '/firms/{firmId}/tasks/{taskId}/complete',
  tags: ['Tasks'],
  summary: 'Mark a task done. Requires task:write.',
  security,
  request: { params: firmIdParam.merge(taskIdParamSchema) },
  responses: { 200: json('The updated task.', objectResponse('Task')), ...tenantErrors },
});

const jsonBody = (schema: z.ZodTypeAny) => ({
  required: true,
  content: { 'application/json': { schema } },
});

registry.registerPath({
  method: 'post',
  path: '/firms',
  tags: ['Tenancy'],
  summary: 'Create a firm. The caller becomes its first OWNER.',
  security,
  request: { body: jsonBody(createFirmSchema) },
  responses: {
    201: json('The firm and the caller’s owner membership.', objectResponse('Firm')),
    401: tenantErrors[401],
    409: problem('SLUG_TAKEN — the handle is already in use.'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/firms/{firmId}/members',
  tags: ['Members'],
  summary: 'List members (removed hidden unless asked for). Requires member:read.',
  security,
  request: { params: firmIdParam, query: listMembersQuerySchema },
  responses: { 200: json('Members.', listResponse('MemberList')), ...tenantErrors },
});

registry.registerPath({
  method: 'patch',
  path: '/firms/{firmId}/members/{membershipId}',
  tags: ['Members'],
  summary:
    'Change a member’s role or suspend/reactivate them. Requires member:manage; only owners touch owners; not your own membership.',
  security,
  request: {
    params: firmIdParam.merge(membershipIdParamSchema),
    body: jsonBody(updateMemberSchema),
  },
  responses: {
    200: json('The updated member.', objectResponse('Member')),
    ...tenantErrors,
    409: problem('LAST_OWNER — the firm would be left without an active owner.'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/firms/{firmId}/members/{membershipId}',
  tags: ['Members'],
  summary: 'Remove a member (soft; access ends immediately). Requires member:manage.',
  security,
  request: { params: firmIdParam.merge(membershipIdParamSchema) },
  responses: {
    204: { description: 'Removed.' },
    ...tenantErrors,
    409: problem('LAST_OWNER — the firm would be left without an active owner.'),
  },
});

registry.registerPath({
  method: 'get',
  path: '/firms/{firmId}/invitations',
  tags: ['Members'],
  summary: 'Pending, unexpired invitations. Requires member:manage.',
  security,
  request: { params: firmIdParam },
  responses: { 200: json('Invitations.', listResponse('InvitationList')), ...tenantErrors },
});

registry.registerPath({
  method: 'post',
  path: '/firms/{firmId}/invitations',
  tags: ['Members'],
  summary:
    'Invite an email with a role (7-day link, emailed). Re-inviting revokes the previous link. Requires member:manage.',
  security,
  request: { params: firmIdParam, body: jsonBody(createInvitationSchema) },
  responses: {
    201: json('The invitation (never the token).', objectResponse('Invitation')),
    ...tenantErrors,
    409: problem('ALREADY_MEMBER.'),
  },
});

registry.registerPath({
  method: 'delete',
  path: '/firms/{firmId}/invitations/{invitationId}',
  tags: ['Members'],
  summary: 'Revoke a pending invitation. Requires member:manage.',
  security,
  request: { params: firmIdParam.merge(invitationIdParamSchema) },
  responses: { 204: { description: 'Revoked.' }, ...tenantErrors },
});

registry.registerPath({
  method: 'post',
  path: '/invitations/accept',
  tags: ['Members'],
  summary: 'Accept an invitation as the signed-in user, whose email must match.',
  security,
  request: { body: jsonBody(acceptInvitationSchema) },
  responses: {
    200: json('The firm and the new membership.', objectResponse('AcceptedInvitation')),
    400: problem('INVALID_OR_EXPIRED_TOKEN.'),
    401: tenantErrors[401],
    403: problem('INVITATION_EMAIL_MISMATCH.'),
    409: problem('ALREADY_MEMBER.'),
  },
});
