import type { Metadata } from "next";
import { ClientContext } from "@/components/workspace/client/ClientContext";

export const metadata: Metadata = { title: "Client" };

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientContext key={id} id={id} />;
}
