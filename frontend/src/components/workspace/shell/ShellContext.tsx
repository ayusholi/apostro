"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export type LauncherAction = "task" | "enquiry" | "note" | "appointment";
export type LauncherScope = "all" | "clients" | "matters";

export type LauncherRequest = {
  action?: LauncherAction;
  scope?: LauncherScope;
  matterId?: string;
  /** Prefills the task form, e.g. from an Assist suggestion the user accepts. */
  title?: string;
};

type Shell = {
  launcher: LauncherRequest | null;
  openLauncher: (request?: LauncherRequest) => void;
  closeLauncher: () => void;
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  /** Effective state: an explicit user choice, otherwise collapsed on tablet widths. */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMac: boolean;
};

const ShellContext = createContext<Shell | null>(null);

const noop = () => () => {};

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [launcher, setLauncher] = useState<LauncherRequest | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [choice, setCollapsed] = useState<boolean | null>(null);
  const tablet = useMediaQuery("(min-width: 760px) and (max-width: 1099px)");
  const mobile = useMediaQuery("(max-width: 759px)");
  const collapsed = !mobile && (choice ?? tablet);
  const isMac = useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );

  const openLauncher = useCallback((request: LauncherRequest = {}) => setLauncher(request), []);
  const closeLauncher = useCallback(() => setLauncher(null), []);

  const value = useMemo(
    () => ({ launcher, openLauncher, closeLauncher, navOpen, setNavOpen, collapsed, setCollapsed, isMac }),
    [launcher, openLauncher, closeLauncher, navOpen, collapsed, setCollapsed, isMac],
  );
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <ShellProvider>");
  return ctx;
}

/** True when focus is somewhere the user is typing, so single-key shortcuts stay out of the way. */
export function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}
