"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  AlarmClock,
  Briefcase,
  CalendarClock,
  Check,
  CheckCircle2,
  Circle,
  Coffee,
  FileSearch,
  Hourglass,
  Inbox,
  Mail,
  MessageSquareReply,
  Phone,
  Plus,
  RotateCcw,
  Send,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { Appointment } from "@/types/workspace";
import { useWorkspace, type Workspace } from "@/components/workspace/WorkspaceProvider";
import { useShell } from "@/components/workspace/shell/ShellContext";
import { ActionMenu, ContextPanel, EmptyState, MatterRef, Tag, type MenuItem, type Tone } from "@/components/workspace/ui";
import { WorkDetail } from "@/components/workspace/work/WorkDetail";
import { dayDiff, formatDay, formatDue, formatLongDate, formatShort, greeting, timeOf } from "@/lib/workspace/dates";

export type Section = "attention" | "today" | "waiting" | "upcoming";

export type WorkSource =
  | { type: "task"; id: string }
  | { type: "conversation"; id: string }
  | { type: "waiting"; id: string }
  | { type: "appointment"; id: string }
  | { type: "keydate"; matterId: string; label: string };

export type WorkItem = {
  key: string;
  section: Section;
  icon: LucideIcon;
  kindLabel: string;
  title: string;
  who?: string;
  matterId?: string;
  reason: string;
  when: string;
  whenTone: Tone;
  sort: string;
  done?: boolean;
  source: WorkSource;
  category: "comms" | "tasks" | "waiting" | "diary";
};

const SECTIONS: { id: Section; label: string; empty: string; emptyText: string; icon: LucideIcon }[] = [
  { id: "attention", label: "Needs attention", empty: "Nothing needs your attention", emptyText: "New enquiries, replies you owe and overdue work will appear here.", icon: Coffee },
  { id: "today", label: "Due today", empty: "Nothing else due today", emptyText: "Tasks and reviews due today will appear here.", icon: CheckCircle2 },
  { id: "waiting", label: "Waiting on others", empty: "Not waiting on anyone", emptyText: "Things you’ve asked clients, other sides or colleagues for will appear here.", icon: Hourglass },
  { id: "upcoming", label: "Upcoming", empty: "Nothing scheduled", emptyText: "Appointments, tasks and recorded key dates for the next three weeks.", icon: CalendarClock },
];

const CATEGORIES = [
  { id: "all", label: "Everything" },
  { id: "comms", label: "Communications" },
  { id: "tasks", label: "Tasks & reviews" },
] as const;

/** Turn the store into one prioritised list. Rules are deliberately simple and
    visible in the "reason" text, so the user can see why each item is here. */
function buildItems(ws: Workspace): WorkItem[] {
  const items: WorkItem[] = [];
  const clientOf = (matterId?: string) => {
    const m = matterId ? ws.lookup.matter.get(matterId) : undefined;
    return m ? ws.lookup.client.get(m.clientId)?.name : undefined;
  };
  const myMatter = (matterId?: string) => {
    const m = matterId ? ws.lookup.matter.get(matterId) : undefined;
    return !!m && (m.responsibleId === ws.me.id || m.assistingIds.includes(ws.me.id));
  };

  for (const c of ws.conversations) {
    const last = c.messages[c.messages.length - 1];
    const lastIn = [...c.messages].reverse().find((m) => m.from === "client");
    if (c.state === "new") {
      items.push({
        key: `c:${c.id}`,
        section: "attention",
        icon: UserPlus,
        kindLabel: "New enquiry",
        title: c.subject,
        who: c.contactName,
        reason: c.assigneeId ? "Enquiry assigned to you — not yet triaged" : "Unassigned enquiry — no one has picked this up",
        when: formatShort(last.sentAt),
        whenTone: dayDiff(last.sentAt) < 0 ? "attention" : "neutral",
        sort: `0-${last.sentAt}`,
        source: { type: "conversation", id: c.id },
        category: "comms",
      });
    } else if (c.state === "awaiting" && c.assigneeId === ws.me.id && last.from === "client") {
      const days = -dayDiff(last.sentAt);
      items.push({
        key: `c:${c.id}`,
        section: "attention",
        icon: MessageSquareReply,
        kindLabel: "Reply owed",
        title: c.subject,
        who: c.contactName,
        matterId: c.matterId,
        reason: days > 0 ? `Client waiting ${days} day${days > 1 ? "s" : ""} for a reply` : `Client asked a question at ${timeOf(last.sentAt)}`,
        when: formatShort(last.sentAt),
        whenTone: days > 0 ? "attention" : "neutral",
        sort: `1-${last.sentAt}`,
        source: { type: "conversation", id: c.id },
        category: "comms",
      });
    } else if (c.state === "open" && c.unread && myMatter(c.matterId) && lastIn) {
      items.push({
        key: `c:${c.id}`,
        section: "attention",
        icon: Mail,
        kindLabel: "Update",
        title: c.subject,
        who: c.contactName,
        matterId: c.matterId,
        reason: lastIn.attachments ? `${lastIn.attachments.length} new documents on your matter` : "New message on your matter",
        when: formatShort(lastIn.sentAt),
        whenTone: "neutral",
        sort: `2-${lastIn.sentAt}`,
        source: { type: "conversation", id: c.id },
        category: "comms",
      });
    }
  }

  for (const t of ws.tasks) {
    if (t.assigneeId !== ws.me.id) continue;
    const diff = dayDiff(t.due);
    // Recently completed work stays in place (marked done) so the user keeps their bearings.
    if (t.status === "done" && (diff < -7 || diff > 0)) continue;
    if (diff > 21) continue;
    const section: Section = diff < 0 ? "attention" : diff === 0 ? "today" : "upcoming";
    items.push({
      key: `t:${t.id}`,
      section,
      icon: t.kind === "review" ? FileSearch : t.kind === "follow-up" ? Phone : CheckCircle2,
      kindLabel: t.kind === "review" ? "Review" : t.kind === "follow-up" ? "Follow-up" : "Task",
      title: t.title,
      who: clientOf(t.matterId),
      matterId: t.matterId,
      reason: t.status === "done" ? "Completed" : diff < 0 ? formatDue(t.due) : (t.detail ?? (t.kind === "review" ? "Document awaiting your review" : formatDue(t.due))),
      when: diff < 0 ? `${-diff}d late` : diff === 0 ? "Today" : formatDay(t.due),
      whenTone: diff < 0 ? "urgent" : diff === 0 ? "attention" : "neutral",
      sort: `${diff < 0 ? "3" : "5"}-${t.due}-${t.title}`,
      done: t.status === "done",
      source: { type: "task", id: t.id },
      category: "tasks",
    });
  }

  for (const w of ws.waiting) {
    if (w.status !== "waiting" || !myMatter(w.matterId)) continue;
    const since = -dayDiff(w.since);
    const chased = w.lastChased ? -dayDiff(w.lastChased) : null;
    items.push({
      key: `w:${w.id}`,
      section: "waiting",
      icon: Hourglass,
      kindLabel: "Waiting",
      title: w.title,
      who: w.waitingOn,
      matterId: w.matterId,
      reason: w.expected
        ? `Response requested by ${formatDay(w.expected)}`
        : chased !== null
          ? `Last chased ${chased === 0 ? "today" : `${chased} day${chased > 1 ? "s" : ""} ago`}`
          : "Not chased yet",
      when: `${since}d`,
      whenTone: since >= 7 && !w.expected ? "attention" : "neutral",
      sort: `6-${w.since}`,
      source: { type: "waiting", id: w.id },
      category: "waiting",
    });
  }

  const relevant = (a: Appointment) => !a.matterId || myMatter(a.matterId);
  for (const a of ws.appointments) {
    const diff = dayDiff(a.start);
    if (diff < 1 || diff > 21 || !relevant(a)) continue;
    items.push({
      key: `a:${a.id}`,
      section: "upcoming",
      icon: CalendarClock,
      kindLabel: "Appointment",
      title: a.title,
      who: a.location,
      matterId: a.matterId,
      reason: `${timeOf(a.start)}–${timeOf(a.end)} · ${a.location}`,
      when: formatDay(a.start),
      whenTone: "neutral",
      sort: `7-${a.start}`,
      source: { type: "appointment", id: a.id },
      category: "tasks",
    });
  }

  for (const m of ws.matters) {
    if (!myMatter(m.id)) continue;
    for (const k of m.keyDates) {
      const diff = dayDiff(k.date);
      if (diff < 1 || diff > 21) continue;
      if (ws.appointments.some((a) => a.matterId === m.id && a.start.startsWith(k.date))) continue;
      items.push({
        key: `k:${m.id}:${k.label}`,
        section: "upcoming",
        icon: AlarmClock,
        kindLabel: "Key date",
        title: k.label,
        who: ws.lookup.client.get(m.clientId)?.name,
        matterId: m.id,
        reason: `Recorded from: ${k.source}`,
        when: formatDay(k.date),
        whenTone: diff <= 7 ? "attention" : "neutral",
        sort: `7-${k.date}`,
        source: { type: "keydate", matterId: m.id, label: k.label },
        category: "tasks",
      });
    }
  }

  return items.sort((a, b) => (a.done === b.done ? a.sort.localeCompare(b.sort) : a.done ? 1 : -1));
}

export function MyWork() {
  const ws = useWorkspace();
  const { openLauncher } = useShell();
  const router = useRouter();
  const [section, setSection] = useState<Section | "all">("all");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<"view" | "reply">("view");
  const listRef = useRef<HTMLDivElement>(null);

  const items = buildItems(ws);
  const filtered = items.filter((i) => category === "all" || i.category === category || (category === "comms" && i.category === "waiting"));
  const counts = Object.fromEntries(SECTIONS.map((s) => [s.id, filtered.filter((i) => i.section === s.id && !i.done).length])) as Record<Section, number>;
  const overdue = filtered.filter((i) => i.whenTone === "urgent" && !i.done).length;
  const selectedItem = items.find((i) => i.key === selected) ?? null;
  const today = ws.appointments.filter((a) => dayDiff(a.start) === 0).sort((a, b) => a.start.localeCompare(b.start));

  const select = (key: string, mode: "view" | "reply" = "view") => {
    setSelected(key);
    setPanelMode(mode);
  };

  const visibleSections = SECTIONS.filter((s) => section === "all" || s.id === section);

  // Arrow keys move between rows when focus is on a row.
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const rows = Array.from(listRef.current?.querySelectorAll<HTMLElement>(".ws-row__main") ?? []);
    const i = rows.indexOf(document.activeElement as HTMLElement);
    if (i === -1) return;
    e.preventDefault();
    rows[e.key === "ArrowDown" ? Math.min(i + 1, rows.length - 1) : Math.max(i - 1, 0)]?.focus();
  };

  const primaryFor = (item: WorkItem): { label: string; icon: LucideIcon; run: () => void } | null => {
    const s = item.source;
    if (item.done) return null;
    switch (s.type) {
      case "conversation": {
        const c = ws.lookup.conversation.get(s.id);
        if (c?.state === "new") return { label: "Triage", icon: Inbox, run: () => router.push(`/workspace/inbox?c=${s.id}`) };
        if (item.kindLabel === "Reply owed") return { label: "Reply", icon: MessageSquareReply, run: () => select(item.key, "reply") };
        return { label: "Open", icon: Mail, run: () => select(item.key) };
      }
      case "task": {
        const t = ws.tasks.find((x) => x.id === s.id);
        if (t?.documentId) return { label: "Review", icon: FileSearch, run: () => select(item.key) };
        if (t?.kind === "follow-up") return { label: "Log call", icon: Phone, run: () => select(item.key, "reply") };
        return { label: "Complete", icon: Check, run: () => ws.setTaskStatus(s.id, "done") };
      }
      case "waiting":
        return { label: "Chase", icon: Send, run: () => ws.chase(s.id) };
      default:
        return null;
    }
  };

  const menuFor = (item: WorkItem): MenuItem[] => {
    const s = item.source;
    const menu: MenuItem[] = [{ label: "Show details", icon: FileSearch, onSelect: () => select(item.key) }];
    if (s.type === "conversation") menu.push({ label: "Open conversation", icon: Inbox, onSelect: () => router.push(`/workspace/inbox?c=${s.id}`) });
    if (s.type === "task") {
      const t = ws.tasks.find((x) => x.id === s.id);
      menu.push(
        t?.status === "done"
          ? { label: "Reopen task", icon: RotateCcw, onSelect: () => ws.setTaskStatus(s.id, "open") }
          : { label: "Mark complete", icon: Check, onSelect: () => ws.setTaskStatus(s.id, "done") },
      );
    }
    if (s.type === "waiting") menu.push({ label: "Mark as received", icon: CheckCircle2, onSelect: () => ws.markReceived(s.id) });
    if (item.matterId) {
      const matterId = item.matterId;
      menu.push("separator", { label: "View matter", icon: Briefcase, onSelect: () => router.push(`/workspace/matters/${matterId}`) });
      menu.push({ label: "Add task on this matter", icon: Plus, onSelect: () => openLauncher({ action: "task", matterId }) });
    }
    return menu;
  };

  return (
    <div className="ws-split">
      <div className="ws-page ws-page--work">
        <header className="ws-pagehead">
          <div>
            <h1 suppressHydrationWarning>
              {greeting()}, {ws.me.name.split(" ")[0]}
            </h1>
            <p className="ws-pagehead__sub">
              {formatLongDate()} · {counts.attention + counts.today} things for you today
              {overdue > 0 && (
                <>
                  {" · "}
                  <span className="ws-text-urgent">{overdue} overdue</span>
                </>
              )}
            </p>
          </div>
          <div className="ws-pagehead__actions">
            <button type="button" className="ws-btn" onClick={() => openLauncher({ action: "task" })}>
              <Plus aria-hidden size={15} /> Task
            </button>
            <button type="button" className="ws-btn ws-btn--primary" onClick={() => openLauncher({ action: "enquiry" })}>
              <UserPlus aria-hidden size={15} /> New enquiry
            </button>
          </div>
        </header>

        {today.length > 0 && (
          <section className="ws-daystrip" aria-label="Today’s diary">
            <h2 className="ws-daystrip__label">Today</h2>
            <ol role="list">
              {today.map((a) => {
                const m = a.matterId ? ws.lookup.matter.get(a.matterId) : undefined;
                return (
                  <li key={a.id} className="ws-daystrip__item">
                    <time>{timeOf(a.start)}</time>
                    <span className="ws-daystrip__title">{a.title}</span>
                    <span className="ws-daystrip__meta">{m ? <MatterRef id={m.id} refText={m.ref} /> : a.location}</span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        <div className="ws-filters">
          <div className="ws-segmented" role="tablist" aria-label="Filter work by section">
            <button type="button" role="tab" aria-selected={section === "all"} onClick={() => setSection("all")}>
              All
            </button>
            {SECTIONS.map((s) => (
              <button key={s.id} type="button" role="tab" aria-selected={section === s.id} onClick={() => setSection(s.id)}>
                {s.label}
                <span className="ws-count">{counts[s.id]}</span>
              </button>
            ))}
          </div>
          <label className="ws-select-inline">
            <span className="ws-sr">Show</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="ws-queue" ref={listRef} onKeyDown={onListKey}>
          {visibleSections.map((s) => {
            const rows = filtered.filter((i) => i.section === s.id);
            if (section === "all" && !rows.length && s.id !== "attention" && s.id !== "today") return null;
            return (
              <section key={s.id} className={`ws-queue__section ws-queue__section--${s.id}`} aria-labelledby={`q-${s.id}`}>
                <h2 id={`q-${s.id}`} className="ws-queue__heading">
                  {s.label}
                  <span className="ws-count">{counts[s.id]}</span>
                </h2>
                {rows.length ? (
                  <ul role="list" className="ws-rows">
                    {rows.map((item) => (
                      <WorkRow
                        key={item.key}
                        item={item}
                        selected={selected === item.key}
                        onSelect={() => select(item.key)}
                        primary={primaryFor(item)}
                        menu={menuFor(item)}
                      />
                    ))}
                  </ul>
                ) : (
                  <EmptyState icon={s.icon} title={s.empty}>
                    {s.emptyText}
                  </EmptyState>
                )}
              </section>
            );
          })}
          <p className="ws-queue__foot">
            Showing work assigned to you and on matters you’re part of. <Link href="/workspace/matters">See all matters</Link>
          </p>
        </div>
      </div>

      <ContextPanel open={!!selectedItem} onClose={() => setSelected(null)} label="Item details" wide>
        {selectedItem && <WorkDetail key={`${selectedItem.key}-${panelMode}`} item={selectedItem} mode={panelMode} onDone={() => setSelected(null)} />}
      </ContextPanel>
    </div>
  );
}

function WorkRow({
  item,
  selected,
  onSelect,
  primary,
  menu,
}: {
  item: WorkItem;
  selected: boolean;
  onSelect: () => void;
  primary: { label: string; icon: LucideIcon; run: () => void } | null;
  menu: MenuItem[];
}) {
  const ws = useWorkspace();
  const matter = item.matterId ? ws.lookup.matter.get(item.matterId) : undefined;
  const Icon = item.icon;
  const isTask = item.source.type === "task";
  const taskId = item.source.type === "task" ? item.source.id : "";

  return (
    <li className="ws-row" aria-current={selected || undefined} data-done={item.done || undefined} onClick={onSelect}>
      <span className={`ws-row__when ws-row__when--${item.whenTone}`}>
        {item.whenTone === "urgent" && <span className="ws-sr">Overdue: </span>}
        {item.when}
      </span>
      {isTask ? (
        <button
          type="button"
          className="ws-checkbtn"
          aria-label={item.done ? `Reopen “${item.title}”` : `Mark “${item.title}” complete`}
          aria-pressed={!!item.done}
          onClick={(e) => {
            e.stopPropagation();
            ws.setTaskStatus(taskId, item.done ? "open" : "done");
          }}
        >
          {item.done ? <CheckCircle2 aria-hidden size={17} /> : <Circle aria-hidden size={17} />}
        </button>
      ) : (
        <span className="ws-row__icon" aria-hidden>
          <Icon size={15} />
        </span>
      )}
      <button type="button" className="ws-row__main" onClick={onSelect} aria-describedby={`${item.key}-meta`}>
        <span className="ws-row__title">
          <span className="ws-row__kind">{item.kindLabel}</span>
          {item.title}
        </span>
        <span className="ws-row__meta" id={`${item.key}-meta`}>
          {item.who && <span className="ws-row__who">{item.who}</span>}
          {matter && <span className="ws-ref">{matter.ref}</span>}
          <span className={`ws-row__reason ws-row__reason--${item.whenTone}`}>{item.reason}</span>
        </span>
      </button>
      <span className="ws-row__actions">
        {primary && (
          <button
            type="button"
            className="ws-btn ws-btn--sm ws-row__primary"
            onClick={(e) => {
              e.stopPropagation();
              primary.run();
            }}
          >
            <primary.icon aria-hidden size={14} />
            {primary.label}
          </button>
        )}
        {item.done && <Tag tone="done">Done</Tag>}
        <ActionMenu label={`More actions for ${item.title}`} items={menu} />
      </span>
    </li>
  );
}
