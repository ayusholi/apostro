import type { Metadata } from "next";
import { ClientsList } from "@/components/workspace/lists";

export const metadata: Metadata = { title: "Clients" };

export default function ClientsPage() {
  return <ClientsList />;
}
