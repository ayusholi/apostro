import type { Metadata } from "next";
import { DocumentsView } from "@/components/workspace/lists";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  return <DocumentsView key={d ?? "docs"} initialId={d} />;
}
