import { z } from 'zod';
import { createTaskSchema, taskIdParamSchema } from '../modules/tasks/tasks.schema';
import { clientIdParamSchema, listClientsQuerySchema } from '../modules/clients/clients.schema';
import {
  listActivityQuerySchema,
  listMatterTasksQuerySchema,
  matterIdParamSchema,
} from '../modules/matters/matters.schema';
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
