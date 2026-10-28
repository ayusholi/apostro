/**
 * The composition root. This is the ONLY file in the codebase allowed to
 * import both a `use-cases/*` function and a concrete adapter class in the
 * same place — everywhere else, use cases only see interfaces
 * (application/booking/ports.ts) and components only see this file's
 * exported functions, never an adapter directly.
 *
 * To connect Postgres later: implement `BookingRepository` (and the three
 * catalog repositories, if the catalog moves to the DB too) against Prisma
 * in infrastructure/booking/postgres/, then change the four `new Static*`/
 * `new InMemoryBookingRepository()` lines below. No use case, Server Action,
 * or component changes. See /prisma/README.md.
 */
import { StaticServiceRepository } from "./booking/memory/StaticServiceRepository";
import { StaticSolicitorRepository } from "./booking/memory/StaticSolicitorRepository";
import { StaticOfficeRepository } from "./booking/memory/StaticOfficeRepository";
import { InMemoryBookingRepository } from "./booking/memory/InMemoryBookingRepository";
import { createNotificationService } from "./booking/notifications/createNotificationService";
import { HoneypotSpamGuard } from "./booking/security/HoneypotSpamGuard";
import { SystemClock } from "./booking/system/SystemClock";
import { CryptoIdGenerator } from "./booking/system/CryptoIdGenerator";

import { listServices, listSolicitorsForService, listOfficesForSolicitor } from "@/application/booking/use-cases/catalog";
import { getAvailability as getAvailabilityUseCase } from "@/application/booking/use-cases/getAvailability";
import { createBooking as createBookingUseCase } from "@/application/booking/use-cases/createBooking";
import { getBookingByToken as getBookingByTokenUseCase } from "@/application/booking/use-cases/getBookingByToken";
import { cancelBooking as cancelBookingUseCase } from "@/application/booking/use-cases/cancelBooking";
import { rescheduleBooking as rescheduleBookingUseCase } from "@/application/booking/use-cases/rescheduleBooking";
import { sendDueReminders as sendDueRemindersUseCase } from "@/application/booking/use-cases/sendDueReminders";

const services = new StaticServiceRepository();
const solicitors = new StaticSolicitorRepository();
const offices = new StaticOfficeRepository();
const bookings = new InMemoryBookingRepository();
const notifications = createNotificationService();
const spamGuard = new HoneypotSpamGuard();
const clock = new SystemClock();
const ids = new CryptoIdGenerator();

const deps = { services, solicitors, offices, bookings, notifications, spamGuard, clock, ids };

export const bookingContainer = {
  listServices: () => listServices(deps),
  listSolicitorsForService: (serviceSlug: string) => listSolicitorsForService(deps, serviceSlug),
  listOfficesForSolicitor: (solicitorSlug: string) => listOfficesForSolicitor(deps, solicitorSlug),
  getAvailability: (input: { serviceSlug: string; solicitorSlug: string; officeId: string }) =>
    getAvailabilityUseCase(deps, input),
  createBooking: (rawInput: unknown, ipAddress: string) => createBookingUseCase(deps, rawInput, ipAddress),
  getBookingByToken: (token: string) => getBookingByTokenUseCase(deps, token),
  cancelBooking: (token: string) => cancelBookingUseCase(deps, token),
  rescheduleBooking: (rawInput: unknown) => rescheduleBookingUseCase(deps, rawInput),
  sendDueReminders: () => sendDueRemindersUseCase(deps),
};
