import { NextResponse, type NextRequest } from "next/server";
import { bookingContainer } from "@/infrastructure/container";

// Never cache — every invocation must re-check what's actually due now.
export const dynamic = "force-dynamic";

/**
 * Triggered by an external scheduler (Vercel Cron — see /vercel.json,
 * hourly). Protected by a bearer secret rather than left open: without this,
 * anyone who discovers the URL could trigger reminder sends repeatedly.
 * Vercel Cron automatically sends this header when CRON_SECRET is set in
 * the project's environment variables.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await bookingContainer.sendDueReminders();
  return NextResponse.json(result);
}
