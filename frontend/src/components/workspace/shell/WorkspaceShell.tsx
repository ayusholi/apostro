"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BarChart3,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Inbox,
  LayoutList,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { WorkspaceProvider, useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { ShellProvider, isTypingTarget, useShell } from "@/components/workspace/shell/ShellContext";
import { CommandLauncher } from "@/components/workspace/shell/CommandLauncher";
import { ActionMenu, Avatar } from "@/components/workspace/ui";
import { firm } from "@/data/workspace/people";
import { dayDiff, formatShort } from "@/lib/workspace/dates";

export function WorkspaceShell({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <WorkspaceProvider>
      <ShellProvider>
        <ShellFrame className={className}>{children}</ShellFrame>
      </ShellProvider>
    </WorkspaceProvider>
  );
}

function ShellFrame({ children, className }: { children: React.ReactNode; className: string }) {
  const { collapsed, navOpen, setNavOpen, launcher, openLauncher, closeLauncher } = useShell();

  // Global shortcuts: Ctrl/⌘+K toggles the launcher from anywhere; "/" opens
  // search only when the user isn't already typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (launcher) closeLauncher();
        else openLauncher();
      } else if (e.key === "/" && !launcher && !isTypingTarget(e.target) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openLauncher();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [launcher, openLauncher, closeLauncher]);

  return (
    <div className={`ws ${className}`} data-collapsed={collapsed || undefined} data-nav-open={navOpen || undefined}>
      <Sidebar />
      {navOpen && <div className="ws-scrim ws-scrim--nav" onClick={() => setNavOpen(false)} aria-hidden />}
      <div className="ws-frame">
        <TopBar />
        <main id="main" className="ws-main" tabIndex={-1}>
          {children}
        </main>
      </div>
      {launcher && <CommandLauncher />}
      <Toasts />
    </div>
  );
}

/* Sidebar ------------------------------------------------------------------- */

type NavItem = { href: string; label: string; icon: LucideIcon; count?: number; exact?: boolean };

function Sidebar() {
  const pathname = usePathname();
  const ws = useWorkspace();
  const { collapsed, setCollapsed, setNavOpen, openLauncher, isMac } = useShell();

  const attention =
    ws.tasks.filter((t) => t.assigneeId === ws.me.id && t.status === "open" && dayDiff(t.due) <= 0).length +
    ws.conversations.filter((c) => c.state === "new" || (c.state === "awaiting" && c.assigneeId === ws.me.id)).length;
  const unread = ws.conversations.filter((c) => c.unread && c.state !== "archived").length;

  const primary: NavItem[] = [
    { href: "/workspace", label: "My Work", icon: LayoutList, count: attention, exact: true },
    { href: "/workspace/inbox", label: "Inbox", icon: Inbox, count: unread },
    { href: "/workspace/matters", label: "Matters", icon: Briefcase },
    { href: "/workspace/clients", label: "Clients", icon: Users },
    { href: "/workspace/documents", label: "Documents", icon: FileText },
  ];
  const secondary: NavItem[] = [
    { href: "/workspace/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/workspace/reports", label: "Reports", icon: BarChart3 },
    { href: "/workspace/team", label: "Team", icon: UserRound },
    { href: "/workspace/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const closeNav = () => setNavOpen(false);

  return (
    <nav className="ws-sidebar" aria-label="Workspace">
      <div className="ws-sidebar__brand">
        <span className="ws-mark" aria-hidden>
          A<span>’</span>
        </span>
        <span className="ws-sidebar__label ws-brand">
          <strong>Apostro</strong>
          <small>{firm.short}</small>
        </span>
        <button type="button" className="ws-iconbtn ws-sidebar__close" onClick={closeNav} aria-label="Close navigation">
          <X aria-hidden size={16} />
        </button>
      </div>

      <button
        type="button"
        className="ws-sidebar__search"
        onClick={() => {
          closeNav();
          openLauncher();
        }}
        data-tip="Search and actions"
      >
        <Search aria-hidden size={15} />
        <span className="ws-sidebar__label">Search &amp; actions</span>
        <kbd className="ws-sidebar__label">{isMac ? "⌘K" : "Ctrl K"}</kbd>
      </button>

      <ul className="ws-nav" role="list">
        {primary.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item)} onNavigate={closeNav} />
        ))}
      </ul>

      <DeskList onNavigate={closeNav} />

      <div className="ws-sidebar__spacer" />

      <ul className="ws-nav ws-nav--secondary" role="list">
        {secondary.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item)} onNavigate={closeNav} />
        ))}
      </ul>

      <button
        type="button"
        className="ws-sidebar__collapse"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
        data-tip={collapsed ? "Expand sidebar" : undefined}
      >
        {collapsed ? <ChevronsRight aria-hidden size={16} /> : <ChevronsLeft aria-hidden size={16} />}
        <span className="ws-sidebar__label">Collapse</span>
      </button>
    </nav>
  );
}

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        className="ws-nav__link"
        aria-current={active ? "page" : undefined}
        data-tip={item.label}
        onClick={onNavigate}
      >
        <Icon aria-hidden size={17} strokeWidth={1.75} />
        <span className="ws-sidebar__label">{item.label}</span>
        {!!item.count && (
          <span className="ws-nav__count" aria-label={`${item.count} need attention`}>
            {item.count}
          </span>
        )}
      </Link>
    </li>
  );
}

/** "On your desk": the matters and clients the user has open, so context
    travels between screens without hunting through lists. */
function DeskList({ onNavigate }: { onNavigate: () => void }) {
  const ws = useWorkspace();
  const pathname = usePathname();
  const items = ws.desk
    .map((d) => {
      if (d.kind === "matter") {
        const m = ws.lookup.matter.get(d.id);
        return m && { ...d, href: `/workspace/matters/${m.id}`, code: m.ref, label: ws.lookup.client.get(m.clientId)?.name ?? m.title };
      }
      const c = ws.lookup.client.get(d.id);
      return c && { ...d, href: `/workspace/clients/${c.id}`, code: "Client", label: c.name };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  if (!items.length) return null;

  return (
    <section className="ws-desk" aria-labelledby="ws-desk-title">
      <h2 id="ws-desk-title" className="ws-desk__title ws-sidebar__label">
        On your desk
      </h2>
      <ul role="list">
        {items.map((item) => (
          <li key={`${item.kind}-${item.id}`} className="ws-desk__item">
            <Link
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              data-tip={`${item.code} · ${item.label}`}
              onClick={onNavigate}
            >
              <span className="ws-desk__code">{item.kind === "matter" ? item.code.split("/")[0] : "CL"}</span>
              <span className="ws-sidebar__label ws-desk__text">
                <span className="ws-desk__ref">{item.code}</span>
                <span className="ws-desk__name">{item.label}</span>
              </span>
            </Link>
            <button
              type="button"
              className="ws-desk__remove ws-sidebar__label"
              aria-label={`Remove ${item.code} ${item.label} from desk`}
              onClick={() => ws.removeDesk({ kind: item.kind, id: item.id })}
            >
              <X aria-hidden size={12} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Top bar ------------------------------------------------------------------- */

function TopBar() {
  const { openLauncher, setNavOpen, isMac } = useShell();
  const ws = useWorkspace();
  const router = useRouter();

  return (
    <header className="ws-topbar">
      <button type="button" className="ws-iconbtn ws-topbar__menu" onClick={() => setNavOpen(true)} aria-label="Open navigation">
        <Menu aria-hidden size={18} />
      </button>

      <button type="button" className="ws-searchbar" onClick={() => openLauncher()} aria-label="Search clients, matters, documents">
        <Search aria-hidden size={16} />
        <span className="ws-searchbar__placeholder">Search clients, matters, documents…</span>
        <kbd>{isMac ? "⌘K" : "Ctrl K"}</kbd>
      </button>

      <div className="ws-topbar__actions">
        <ActionMenu
          label="Create"
          className="ws-btn ws-btn--primary"
          trigger={
            <>
              <Plus aria-hidden size={15} />
              <span className="ws-hide-sm">Create</span>
            </>
          }
          items={[
            { label: "New enquiry", icon: Inbox, onSelect: () => openLauncher({ action: "enquiry" }) },
            { label: "Task", icon: CheckCircle2, onSelect: () => openLauncher({ action: "task" }) },
            { label: "Attendance note", icon: FileText, onSelect: () => openLauncher({ action: "note" }) },
            { label: "Appointment", icon: CalendarDays, onSelect: () => openLauncher({ action: "appointment" }) },
          ]}
        />
        <Notifications />
        <ActionMenu
          label={`Account: ${ws.me.name}`}
          className="ws-profile"
          trigger={<Avatar person={ws.me} size="md" />}
          items={[
            { label: `${ws.me.name} · ${ws.me.role}`, icon: UserRound, onSelect: () => router.push("/workspace/team") },
            { label: "Settings", icon: Settings, onSelect: () => router.push("/workspace/settings") },
            "separator",
            { label: "Sign out (disabled in prototype)", icon: LogOut, onSelect: () => {}, disabled: true },
          ]}
        />
      </div>
    </header>
  );
}

function Notifications() {
  const ws = useWorkspace();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const unread = ws.notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="ws-menuwrap" ref={wrap}>
      <button
        type="button"
        className="ws-iconbtn ws-iconbtn--lg"
        aria-expanded={open}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        title="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell aria-hidden size={17} />
        {unread > 0 && <span className="ws-dot" aria-hidden />}
      </button>
      {open && (
        <div className="ws-popover ws-popover--notifications" role="region" aria-label="Notifications">
          <div className="ws-popover__head">
            <strong>Notifications</strong>
            <button type="button" className="ws-linkbtn" onClick={ws.readNotifications} disabled={!unread}>
              Mark all read
            </button>
          </div>
          <ul role="list">
            {ws.notifications.map((n) => (
              <li key={n.id}>
                <Link href={n.href} className="ws-notification" data-unread={!n.read || undefined} onClick={() => setOpen(false)}>
                  <span>{n.text}</span>
                  <time>{formatShort(n.at)}</time>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* Toasts -------------------------------------------------------------------- */

function Toasts() {
  const { toasts, dismissToast } = useWorkspace();
  return (
    <div className="ws-toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`ws-toast${t.tone === "success" ? " ws-toast--success" : ""}`}>
          {t.tone === "success" && <CheckCircle2 aria-hidden size={16} />}
          <span>{t.message}</span>
          {t.action && (
            <button
              type="button"
              className="ws-toast__action"
              onClick={() => {
                t.action?.onClick();
                dismissToast(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
          <button type="button" className="ws-toast__close" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            <X aria-hidden size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
