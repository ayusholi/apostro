import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendOk } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import * as rolesService from './roles.service';
import type { CreateRoleInput, SetPermissionsInput, UpdateRoleInput } from './roles.schema';

export async function listRoles(_req: Request, res: Response): Promise<void> {
  const roles = await rolesService.listRoles();
  sendOk(res, roles);
}

export async function createRole(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreateRoleInput>(req, 'body');
  const role = await rolesService.createRole(input);
  sendCreated(res, role);
}

export async function getRole(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const role = await rolesService.getRole(id);
  sendOk(res, role);
}

export async function updateRole(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdateRoleInput>(req, 'body');
  const role = await rolesService.updateRole(id, input);
  sendOk(res, role);
}

export async function setRolePermissions(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<SetPermissionsInput>(req, 'body');
  const role = await rolesService.setRolePermissions(id, input);
  sendOk(res, role);
}

export async function deleteRole(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await rolesService.deleteRole(id);
  sendNoContent(res);
}

export async function listPermissions(_req: Request, res: Response): Promise<void> {
  const permissions = await rolesService.listPermissions();
  sendOk(res, permissions);
}
