import type { Request, Response } from 'express';
import { sendAccepted, sendNoContent, sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import * as enquiriesService from './enquiries.service';
import type {
  AssignEnquiryInput,
  CreateEnquiryInput,
  ListEnquiriesQuery,
  UpdateEnquiryInput,
} from './enquiries.schema';

export async function createEnquiry(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreateEnquiryInput>(req, 'body');
  const { reference } = await enquiriesService.createEnquiry(input);
  sendAccepted(res, { reference });
}

export async function listEnquiries(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListEnquiriesQuery>(req, 'query');
  const { data, pageInfo } = await enquiriesService.listEnquiries(query);
  sendPaginated(res, data, pageInfo);
}

export async function getEnquiry(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const enquiry = await enquiriesService.getEnquiry(id);
  sendOk(res, enquiry);
}

export async function updateEnquiry(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdateEnquiryInput>(req, 'body');
  const enquiry = await enquiriesService.updateEnquiry(id, input);
  sendOk(res, enquiry);
}

export async function assignEnquiry(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<AssignEnquiryInput>(req, 'body');
  const enquiry = await enquiriesService.assignEnquiry(id, input);
  sendOk(res, enquiry);
}

export async function deleteEnquiry(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await enquiriesService.deleteEnquiry(id);
  sendNoContent(res);
}
