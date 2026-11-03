import type { Metadata, Viewport } from "next";
import { WorkspaceShell } from "@/components/workspace/shell/WorkspaceShell";
import { workspaceFontVariables } from "@/lib/workspace/fonts";
import "@/styles/workspace.css";

/**
 * Apostro practice workspace (frontend prototype). Lives alongside the
 * marketing site but shares none of its chrome: its own shell, fonts and
 * scoped stylesheet. All data is local mock data — see src/data/workspace.
 */
export const metadata: Metadata = {
  title: { default: "My Work", template: "%s · Apostro" },
  description: "Apostro legal practice workspace — prototype.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f3ee",
  colorScheme: "light",
};

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell className={workspaceFontVariables}>{children}</WorkspaceShell>;
}
