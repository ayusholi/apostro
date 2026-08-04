import type { Request, Response } from 'express';
import { sendCreated, sendNoContent, sendOk, sendPaginated } from '../../shared/response';
import { getValidated } from '../../validation/validate';
import type { ReorderInput } from '../../validation/common.schema';
import * as faqService from './faq.service';
import type {
  CreateFaqInput,
  ListAdminFaqsQuery,
  ListPublicFaqsQuery,
  UpdateFaqInput,
} from './faq.schema';

export async function listPublicFaqs(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListPublicFaqsQuery>(req, 'query');
  const faqs = await faqService.listPublicFaqs(query);
  sendOk(res, faqs);
}

export async function listFaqsForAdmin(req: Request, res: Response): Promise<void> {
  const query = getValidated<ListAdminFaqsQuery>(req, 'query');
  const { data, pageInfo } = await faqService.listFaqsForAdmin(query);
  sendPaginated(res, data, pageInfo);
}

export async function createFaq(req: Request, res: Response): Promise<void> {
  const input = getValidated<CreateFaqInput>(req, 'body');
  const faq = await faqService.createFaq(input);
  sendCreated(res, faq);
}

export async function updateFaq(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const input = getValidated<UpdateFaqInput>(req, 'body');
  const faq = await faqService.updateFaq(id, input);
  sendOk(res, faq);
}

export async function deleteFaq(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  await faqService.deleteFaq(id);
  sendNoContent(res);
}

export async function publishFaq(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const faq = await faqService.publishFaq(id);
  sendOk(res, faq);
}

export async function unpublishFaq(req: Request, res: Response): Promise<void> {
  const { id } = getValidated<{ id: string }>(req, 'params');
  const faq = await faqService.unpublishFaq(id);
  sendOk(res, faq);
}

export async function reorderFaqs(req: Request, res: Response): Promise<void> {
  const input = getValidated<ReorderInput>(req, 'body');
  await faqService.reorderFaqs(input);
  sendNoContent(res);
}
