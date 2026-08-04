import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors';
import { sendCreated, sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import * as appointmentsService from './appointments.service';
import type {
  AdminCancelBookingInput,
  AdminCreateBookingInput,
  AvailabilityQuery,
  CancelBookingInput,
  CreateBookingInput,
  ListAdminBookingsQuery,
  ListPortalBookingsQuery,
  RescheduleBookingInput,
  UpdateBookingInput,
} from './appointments.schema';

// ── Public ───────────────────────────────────────────────────────────────

export async function getAvailability(req: Request, res: Response): Promise<void> {
  const query = getValidated<AvailabilityQuery>(req, 'query');
  const result = await appointmentsService.getAvailability(query);
  sendOk(res, result);
}

export async function createPublicBooking(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreateBookingInput>(req, 'body');
  const booking = await appointmentsService.createPublicBooking(input);
  sendCreated(res, booking);
}

export async function getBookingByManageToken(req: Request, res: Response): Promise<void> {
  const { manageToken } = getValidated<{ manageToken: string }>(req, 'params');
  const booking = await appointmentsService.getBookingByManageToken(manageToken);
  sendOk(res, booking);
}

export async function cancelBookingByManageToken(req: Request, res: Response): Promise<void> {
  const { manageToken } = getValidated<{ manageToken: string }>(req, 'params');
  const input = getValidated<CancelBookingInput>(req, 'body');
  const booking = await appointmentsService.cancelBookingByManageToken(manageToken, input);
  sendOk(res, booking);
}

export async function rescheduleBookingByManageToken(req: Request, res: Response): Promise<void> {
  const { manageToken } = getValidated<{ manageToken: string }>(req, 'params');
  const input = getValidated<RescheduleBookingInput>(req, 'body');
  const booking = await appointmentsService.rescheduleBookingByManageToken(manageToken, input);
  sendOk(res, booking);
}

// ── Admin ────────────────────────────────────────────────────────────────

export async function listBookingsForAdmin(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListAdminBookingsQuery>(req, 'query');
  const { data, pageInfo } = await appointmentsService.listBookingsForAdmin(query);
  sendPaginated(res, data, pageInfo);
}

export async function getBookingForAdmin(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const booking = await appointmentsService.getBookingForAdmin(id);
  sendOk(res, booking);
}

export async function createBookingForAdmin(req: Request, res: Response): Promise<void> {
  const input = getValidated<AdminCreateBookingInput>(req, 'body');
  const booking = await appointmentsService.createBookingForAdmin(input);
  sendCreated(res, booking);
}

export async function updateBookingForAdmin(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdateBookingInput>(req, 'body');
  const booking = await appointmentsService.updateBookingForAdmin(id, input);
  sendOk(res, booking);
}

export async function cancelBookingForAdmin(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<AdminCancelBookingInput>(req, 'body');
  const booking = await appointmentsService.cancelBookingForAdmin(id, input);
  sendOk(res, booking);
}

export async function rescheduleBookingForAdmin(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<RescheduleBookingInput>(req, 'body');
  const booking = await appointmentsService.rescheduleBookingForAdmin(id, input);
  sendOk(res, booking);
}

// ── Portal ───────────────────────────────────────────────────────────────

export async function listBookingsForClient(req: Request, res: Response): Promise<void> {
  if (!req.principal) throw AppError.unauthenticated();
  const query = getValidated<ListPortalBookingsQuery>(req, 'query');
  const { data, pageInfo } = await appointmentsService.listBookingsForClient(
    req.principal.id,
    query,
  );
  sendPaginated(res, data, pageInfo);
}

export async function getBookingForClient(req: Request, res: Response): Promise<void> {
  if (!req.principal) throw AppError.unauthenticated();
  const { id } = getValidated<{ id: string }>(req, 'params');
  const booking = await appointmentsService.getBookingForClient(req.principal.id, id);
  sendOk(res, booking);
}
