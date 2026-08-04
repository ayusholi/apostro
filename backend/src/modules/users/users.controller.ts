import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import * as usersService from './users.service';
import type {
  AssignRoleInput,
  CreateUserInput,
  ListUsersQuery,
  SuspendUserInput,
  UpdateUserInput,
} from './users.schema';

export async function listUsers(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListUsersQuery>(req, 'query');
  const { data, pageInfo } = await usersService.listUsers(query);
  sendPaginated(res, data, pageInfo);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreateUserInput>(req, 'body');
  const user = await usersService.createUser(input);
  sendCreated(res, user);
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const user = await usersService.getUser(id);
  sendOk(res, user);
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdateUserInput>(req, 'body');
  const user = await usersService.updateUser(id, input);
  sendOk(res, user);
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await usersService.deleteUser(id);
  sendNoContent(res);
}

export async function assignRole(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<AssignRoleInput>(req, 'body');
  const assignment = await usersService.assignRole(id, input);
  sendCreated(res, assignment);
}

export async function revokeRoleAssignment(req: Request, res: Response): Promise<void> {
  const { id, assignmentId } = getValidated<{ id: string; assignmentId: string }>(req, 'params');
  await usersService.revokeRoleAssignment(id, assignmentId);
  sendNoContent(res);
}

export async function suspendUser(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<SuspendUserInput>(req, 'body');
  const user = await usersService.suspendUser(id, input);
  sendOk(res, user);
}

export async function reactivateUser(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const user = await usersService.reactivateUser(id);
  sendOk(res, user);
}

export async function listUserSessions(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const sessions = await usersService.listUserSessions(id);
  sendOk(res, sessions);
}

export async function revokeAllUserSessions(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await usersService.revokeAllUserSessions(id);
  sendNoContent(res);
}
