"use server";

import { headers } from "next/headers";
import { bookingContainer } from "@/infrastructure/container";
import type { CreateBookingInput, RescheduleBookingInput } from "@/application/booking/dto";

/**
 * The thinnest possible layer: extract what only Next.js can provide (the
 * request's IP address), then hand straight to the composition root. No
 * booking logic lives here — that's the point of the layers underneath.
 */
async function clientIp(): Promise<string> {
  const h = await headers();
  // x-forwarded-for can be a comma-separated chain (client, proxy1, proxy2…) — the first entry is the original client.
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export async function listServicesAction() {
  return bookingContainer.listServices();
}

export async function listSolicitorsForServiceAction(serviceSlug: string) {
  return bookingContainer.listSolicitorsForService(serviceSlug);
}

export async function listOfficesForSolicitorAction(solicitorSlug: string) {
  return bookingContainer.listOfficesForSolicitor(solicitorSlug);
}

export async function getAvailabilityAction(input: { serviceSlug: string; solicitorSlug: string; officeId: string }) {
  return bookingContainer.getAvailability(input);
}

export async function createBookingAction(input: CreateBookingInput) {
  const ip = await clientIp();
  return bookingContainer.createBooking(input, ip);
}

export async function getBookingByTokenAction(token: string) {
  return bookingContainer.getBookingByToken(token);
}

export async function cancelBookingAction(token: string) {
  return bookingContainer.cancelBooking(token);
}

export async function rescheduleBookingAction(input: RescheduleBookingInput) {
  return bookingContainer.rescheduleBooking(input);
}
