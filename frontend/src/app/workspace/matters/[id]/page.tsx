import type { Metadata } from "next";
import { MatterWorkspace } from "@/components/workspace/matter/MatterWorkspace";

export const metadata: Metadata = { title: "Matter" };

export default async function MatterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  return <MatterWorkspace key={`${id}-${tab ?? ""}`} id={id} initialTab={tab} />;
}
