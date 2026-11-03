import type { Metadata } from "next";
import { Inbox } from "@/components/workspace/inbox/Inbox";

export const metadata: Metadata = { title: "Inbox" };

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  // Keyed so a link to another conversation (e.g. from a notification) reselects.
  return <Inbox key={c ?? "inbox"} initialId={c} />;
}
