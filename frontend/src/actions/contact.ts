"use server";

import { headers } from "next/headers";
import { contactContainer } from "@/infrastructure/contactContainer";
import type { ContactEnquiryInput } from "@/application/contact/dto";

/** Mirrors actions/booking.ts's clientIp() — the thinnest possible layer over the composition root. */
async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export async function submitContactEnquiryAction(input: ContactEnquiryInput) {
  const ip = await clientIp();
  return contactContainer.sendEnquiry(input, ip);
}
