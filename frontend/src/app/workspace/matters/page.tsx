import type { Metadata } from "next";
import { MattersList } from "@/components/workspace/lists";

export const metadata: Metadata = { title: "Matters" };

export default function MattersPage() {
  return <MattersList />;
}
