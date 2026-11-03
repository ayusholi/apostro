"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  CalendarPlus,
  CheckSquare,
  CornerDownLeft,
  FileText,
  Inbox,
  LayoutList,
  MessageSquare,
  NotebookPen,
  Search,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { type LauncherAction, type LauncherScope, useShell } from "@/components/workspace/shell/ShellContext";
import { AppointmentForm, EnquiryForm, NoteForm, TaskForm } from "@/components/workspace/forms";
import { formatShort } from "@/lib/workspace/dates";

type Result = {
  id: string;
  group: string;
  icon: LucideIcon;
  title: string;
  meta?: string;
  hint?: string;
  run: () => void;
};

const ACTION_TITLES: Record<LauncherAction, string> = {
  enquiry: "Create enquiry",
  task: "Create task",
  note: "Add attendance note",
  appointment: "Schedule appointment",
};

const SCOPES: { id: LauncherScope; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "clients", label: "Clients" },
  { id: "matters", label: "Matters" },
];

export function CommandLauncher() {
  const ws = useWorkspace();
  const router = useRouter();
  const { launcher, closeLauncher, openLauncher, isMac } = useShell();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const action = launcher?.action;
  const scope = launcher?.scope ?? "all";

  // Restore focus to whatever opened the launcher once it closes.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    return () => previous?.focus?.();
  }, []);

  const go = (href: string) => {
    closeLauncher();
    router.push(href);
  };

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const match = (...fields: (string | undefined)[]) => !q || fields.some((f) => f?.toLowerCase().includes(q));
    const out: Result[] = [];

    if (scope === "all") {
      const actions: Result[] = [
        { id: "a-enquiry", group: "Quick actions", icon: UserPlus, title: "Create enquiry", hint: "Log a new prospective client", run: () => openLauncher({ action: "enquiry" }) },
        { id: "a-task", group: "Quick actions", icon: CheckSquare, title: "Create task", hint: "Title, due date, assignee, matter", run: () => openLauncher({ action: "task" }) },
        { id: "a-note", group: "Quick actions", icon: NotebookPen, title: "Add attendance note", hint: "Record a call or meeting on a matter", run: () => openLauncher({ action: "note" }) },
        { id: "a-appt", group: "Quick actions", icon: CalendarPlus, title: "Schedule appointment", run: () => openLauncher({ action: "appointment" }) },
        { id: "a-client", group: "Quick actions", icon: Users, title: "Find client", run: () => { setQuery(""); openLauncher({ scope: "clients" }); } },
        { id: "a-matter", group: "Quick actions", icon: Briefcase, title: "Open matter", run: () => { setQuery(""); openLauncher({ scope: "matters" }); } },
        { id: "a-inbox", group: "Go to", icon: Inbox, title: "Inbox", run: () => go("/workspace/inbox") },
        { id: "a-work", group: "Go to", icon: LayoutList, title: "My Work", run: () => go("/workspace") },
      ];
      out.push(...actions.filter((a) => match(a.title, a.hint, a.group)));
    }

    if (scope !== "matters") {
      ws.clients
        .filter((c) => match(c.name, c.email, c.contact, c.phone))
        .forEach((c) =>
          out.push({
            id: `c-${c.id}`,
            group: "Clients",
            icon: Users,
            title: c.name,
            meta: [c.contact, `${ws.matters.filter((m) => m.clientId === c.id).length} matters`].filter(Boolean).join(" · "),
            run: () => go(`/workspace/clients/${c.id}`),
          }),
        );
    }

    if (scope !== "clients") {
      ws.matters
        .filter((m) => match(m.ref, m.title, m.type, ws.lookup.client.get(m.clientId)?.name))
        .forEach((m) =>
          out.push({
            id: `m-${m.id}`,
            group: "Matters",
            icon: Briefcase,
            title: `${m.ref}  ${m.title}`,
            meta: `${ws.lookup.client.get(m.clientId)?.name} · ${m.status}`,
            run: () => go(`/workspace/matters/${m.id}`),
          }),
        );
    }

    if (scope === "all" && q) {
      ws.documents
        .filter((d) => match(d.name, ws.lookup.matter.get(d.matterId)?.ref))
        .forEach((d) =>
          out.push({
            id: `d-${d.id}`,
            group: "Documents",
            icon: FileText,
            title: d.name,
            meta: `${ws.lookup.matter.get(d.matterId)?.ref} · ${d.status}`,
            run: () => go(`/workspace/documents?d=${d.id}`),
          }),
        );
      ws.conversations
        .filter((c) => match(c.contactName, c.subject, ...c.messages.map((m) => m.body)))
        .forEach((c) =>
          out.push({
            id: `v-${c.id}`,
            group: "Conversations",
            icon: MessageSquare,
            title: `${c.contactName} — ${c.subject}`,
            meta: formatShort(c.messages[c.messages.length - 1].sentAt),
            run: () => go(`/workspace/inbox?c=${c.id}`),
          }),
        );
    }

    // Without a query, keep the default list short: actions plus a few matters.
    return q ? out : out.filter((r) => r.group !== "Clients" || scope === "clients").slice(0, scope === "all" ? 13 : 20);
    // `go` and `openLauncher` are stable for the dialog's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, scope, ws.clients, ws.matters, ws.documents, ws.conversations, ws.lookup]);

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  useEffect(() => {
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listId]);

  // Simple focus trap: Tab cycles within the dialog.
  const onDialogKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (action || scope !== "all") openLauncher({});
      else closeLauncher();
      return;
    }
    if (e.key !== "Tab" || !dialog.current) return;
    const focusable = Array.from(
      dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, textarea, [tabindex="0"]'),
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((activeIndex + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((activeIndex - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[activeIndex]?.run();
    } else if (e.key === "Backspace" && !query && scope !== "all") {
      openLauncher({});
    }
  };

  return (
    <div className="ws-launcher-layer">
      <div className="ws-scrim ws-scrim--launcher" onClick={closeLauncher} aria-hidden />
      <div
        ref={dialog}
        className="ws-launcher"
        role="dialog"
        aria-modal="true"
        aria-label={action ? ACTION_TITLES[action] : "Search and quick actions"}
        onKeyDown={onDialogKey}
      >
        {action ? (
          <>
            <div className="ws-launcher__head">
              <button type="button" className="ws-iconbtn" onClick={() => openLauncher({})} aria-label="Back to search">
                <ArrowLeft aria-hidden size={16} />
              </button>
              <h2>{ACTION_TITLES[action]}</h2>
              <kbd>Esc</kbd>
            </div>
            <div className="ws-launcher__form">
              {action === "task" && <TaskForm matterId={launcher?.matterId} title={launcher?.title} onDone={closeLauncher} onCancel={closeLauncher} />}
              {action === "note" && <NoteForm matterId={launcher?.matterId} onDone={closeLauncher} onCancel={closeLauncher} />}
              {action === "enquiry" && <EnquiryForm onDone={closeLauncher} onCancel={closeLauncher} />}
              {action === "appointment" && <AppointmentForm matterId={launcher?.matterId} onDone={closeLauncher} onCancel={closeLauncher} />}
            </div>
          </>
        ) : (
          <>
            <div className="ws-launcher__search">
              <Search aria-hidden size={18} />
              <input
                ref={input}
                autoFocus
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={results.length ? `${listId}-${activeIndex}` : undefined}
                aria-autocomplete="list"
                aria-label="Search or choose an action"
                placeholder={
                  scope === "clients" ? "Find a client by name, email or phone…" : scope === "matters" ? "Find a matter by reference, title or client…" : "Search clients, matters, documents, or type an action…"
                }
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
              />
            </div>
            <div className="ws-launcher__scopes" role="group" aria-label="Search in">
              {SCOPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="ws-chip"
                  aria-pressed={scope === s.id}
                  onClick={() => {
                    openLauncher({ scope: s.id });
                    setActive(0);
                    input.current?.focus();
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <ul className="ws-launcher__results" id={listId} role="listbox" aria-label="Results">
              {results.map((r, i) => {
                const heading = i === 0 || results[i - 1].group !== r.group ? r.group : null;
                return (
                  <li key={r.id} role="presentation">
                    {heading && (
                      <div className="ws-launcher__group" role="presentation">
                        {heading}
                      </div>
                    )}
                    <div
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      className="ws-launcher__option"
                      onMouseMove={() => i !== activeIndex && setActive(i)}
                      onClick={r.run}
                    >
                      <r.icon aria-hidden size={16} />
                      <span className="ws-launcher__title">{r.title}</span>
                      {(r.meta || r.hint) && <span className="ws-launcher__meta">{r.meta ?? r.hint}</span>}
                      {i === activeIndex && <CornerDownLeft aria-hidden size={14} className="ws-launcher__enter" />}
                    </div>
                  </li>
                );
              })}
              {!results.length && (
                <li className="ws-launcher__none" role="presentation">
                  No results for “{query}”. Try a client surname, a matter reference such as <span className="ws-ref">PRO/0142</span>, or a document name.
                </li>
              )}
            </ul>
            <div className="ws-launcher__foot" aria-hidden>
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> move
              </span>
              <span>
                <kbd>↵</kbd> open
              </span>
              <span>
                <kbd>Esc</kbd> close
              </span>
              <span className="ws-launcher__foot-end">
                <kbd>{isMac ? "⌘K" : "Ctrl K"}</kbd> anywhere
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
