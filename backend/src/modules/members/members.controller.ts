import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendOk } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import { getTenant } from '../tenancy/tenancy.middleware';
import * as invitationsService from './invitations.service';
import type {
  AcceptInvitationInput,
  CreateInvitationInput,
  ListMembersQuery,
  UpdateMemberInput,
} from './members.schema';
import * as membersService from './members.service';

export async function listMembers(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListMembersQuery>(req, 'query');
  sendOk(res, { data: await membersService.listMembers(getTenant(req), query) });
}

export async function updateMember(req: Request, res: Response): Promise<void> {
  const { membershipId } = getValidated<{ membershipId: string }>(req, 'params');
  const input = getValidated<UpdateMemberInput>(req, 'body');
  sendOk(res, await membersService.updateMember(getTenant(req), membershipId, input));
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  const { membershipId } = getValidated<{ membershipId: string }>(req, 'params');
  await membersService.removeMember(getTenant(req), membershipId);
  sendNoContent(res);
}

export async function listInvitations(req: Request, res: Response): Promise<void> {
  sendOk(res, { data: await invitationsService.listInvitations(getTenant(req)) });
}

export async function createInvitation(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreateInvitationInput>(req, 'body');
  sendCreated(res, await invitationsService.createInvitation(getTenant(req), input));
}

export async function revokeInvitation(req: Request, res: Response): Promise<void> {
  const { invitationId } = getValidated<{ invitationId: string }>(req, 'params');
  await invitationsService.revokeInvitation(getTenant(req), invitationId);
  sendNoContent(res);
}

export async function acceptInvitation(req: Request, res: Response): Promise<void> {
  const { token } = getValidated<AcceptInvitationInput>(req, 'body');
  sendOk(res, await invitationsService.acceptInvitation(req.principal!.id, token));
}
