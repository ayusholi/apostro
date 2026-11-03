"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Briefcase,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  FilePlus2,
  FileText,
  Hourglass,
  MessageSquare,
  NotebookPen,
  Plus,
  RefreshCw,
  RotateCcw,
  Send,
} from "lucide-react";
import type { ActivityKind, Matter, MatterStatus } from "@/types/workspace";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { useShell } from "@/components/workspace/shell/ShellContext";
import { Assist } from "@/components/workspace/assist";
import { DocumentPreview, Timeline, docTone, dueTone, statusTone } from "@/components/workspace/context";
import { ActionMenu, Avatar, ChannelMark, ContextPanel, EmptyState, SectionTitle, Tag } from "@/components/workspace/ui";
import { dayDiff, formatDay, formatDue, formatFullDate, formatShort, formatStamp, timeOf } from "@/lib/workspace/dates";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "documents", label: "Documents" },
  { id: "tasks", label: "Tasks & deadlines" },
  { id: "comms", label: "Communications" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const STATUSES: MatterStatus[] = ["Enquiry", "Open", "Awaiting client", "On hold", "Completed"];

export function MatterWorkspace({ id, initialTab }: { id: string; initialTab?: string }) {
  const ws = useWorkspace();
  const router = useRouter();
  const { openLauncher } = useShell();
  const matter = ws.lookup.matter.get(id);
  const [tab, setTab] = useState<TabId>(TABS.some((t) => t.id === initialTab) ? (initialTab as TabId) : "overview");
  const [noteOpen, setNoteOpen] = useState(false);
  const [docId, setDocId] = useState<string | null>(null);

  const { touchDesk } = ws;
  const found = Boolean(matter);
  useEffect(() => {
    if (found) touchDesk({ kind: "matter", id });
  }, [found, id, touchDesk]);

  if (!matter) {
    return (
      <div className="ws-page">
        <EmptyState icon={Briefcase} title="Matter not found" action={<Link href="/workspace/matters" className="ws-btn">Back to matters</Link>}>
          It may have been created in another session. Prototype data resets when the page reloads.
        </EmptyState>
      </div>
    );
  }

  const client = ws.lookup.client.get(matter.clientId);
  const responsible = ws.lookup.person.get(matter.responsibleId);
  const convo = ws.conversations.find((c) => c.matterId === matter.id && c.clientId === matter.clientId);
  const docs = ws.documents.filter((d) => d.matterId === matter.id);
  const doc = docId ? ws.lookup.document.get(docId) : undefined;

  const contactClient = () => {
    if (convo) router.push(`/workspace/inbox?c=${convo.id}`);
    else if (client) window.location.assign(`mailto:${client.email}`);
  };

  return (
    <div className="ws-split">
      <div className="ws-page ws-page--matter">
        <nav className="ws-crumbs" aria-label="Breadcrumb">
          <Link href="/workspace/matters">Matters</Link>
          <ChevronRight aria-hidden size={13} />
          <span aria-current="page">{matter.ref}</span>
        </nav>

        <header className="ws-matterhead">
          <div className="ws-matterhead__main">
            <p className="ws-matterhead__ref">
              <span className="ws-ref">{matter.ref}</span>
              <span>{matter.type}</span>
              <Tag tone={statusTone(matter.status)}>{matter.status}</Tag>
            </p>
            <h1>{matter.title}</h1>
            <dl className="ws-matterhead__meta">
              <div>
                <dt>Client</dt>
                <dd>{client && <Link href={`/workspace/clients/${client.id}`}>{client.name}</Link>}</dd>
              </div>
              <div>
                <dt>Responsible</dt>
                <dd className="ws-inline-person">
                  <Avatar person={responsible} /> {responsible?.name}
                </dd>
              </div>
              <div>
                <dt>Opened</dt>
                <dd>{formatFullDate(matter.opened)}</dd>
              </div>
              {matter.keyDates[0] && (
                <div>
                  <dt>{matter.keyDates[0].label}</dt>
                  <dd>
                    {formatDay(matter.keyDates[0].date)}
                    {dayDiff(matter.keyDates[0].date) > 0 && <span className="ws-muted"> · in {dayDiff(matter.keyDates[0].date)} days</span>}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <div className="ws-matterhead__actions">
            <button type="button" className="ws-btn" onClick={() => { setTab("overview"); setNoteOpen(true); }}>
              <NotebookPen aria-hidden size={15} /> Add note
            </button>
            <button type="button" className="ws-btn" onClick={() => openLauncher({ action: "task", matterId: matter.id })}>
              <Plus aria-hidden size={15} /> Task
            </button>
            <button type="button" className="ws-btn ws-btn--primary" onClick={contactClient}>
              <Send aria-hidden size={15} /> Contact client
            </button>
            <ActionMenu
              label="More matter actions"
              items={[
                { label: "Add document", icon: FilePlus2, onSelect: () => ws.toast({ message: "Uploads aren’t connected in this prototype" }) },
                { label: "Schedule appointment", icon: CalendarClock, onSelect: () => openLauncher({ action: "appointment", matterId: matter.id }) },
                { label: "Attendance note", icon: NotebookPen, onSelect: () => openLauncher({ action: "note", matterId: matter.id }) },
                "separator",
                ...STATUSES.filter((s) => s !== matter.status).map((s) => ({
                  label: `Set status: ${s}`,
                  icon: RefreshCw,
                  onSelect: () => ws.setMatterStatus(matter.id, s),
                })),
              ]}
            />
          </div>
        </header>

        <StageTrack matter={matter} />

        <div className="ws-tabs" role="tablist" aria-label="Matter views">
          {TABS.map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.id === "documents" && <span className="ws-count">{docs.length}</span>}
              {t.id === "tasks" && <span className="ws-count">{ws.tasks.filter((x) => x.matterId === matter.id && x.status === "open").length}</span>}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="ws-tabpanel">
          {tab === "overview" && <Overview matter={matter} noteOpen={noteOpen} setNoteOpen={setNoteOpen} onTab={setTab} />}
          {tab === "activity" && <ActivityTab matter={matter} />}
          {tab === "documents" && <DocumentsTab matterId={matter.id} selected={docId} onSelect={setDocId} />}
          {tab === "tasks" && <TasksTab matter={matter} />}
          {tab === "comms" && <CommsTab matterId={matter.id} />}
        </div>
      </div>

      <ContextPanel open={!!doc} onClose={() => setDocId(null)} label="Document preview" wide>
        {doc && <DocumentPreview doc={doc} />}
      </ContextPanel>
    </div>
  );
}

function StageTrack({ matter }: { matter: Matter }) {
  return (
    <div className="ws-stages">
      <ol aria-label={`Progress: stage ${matter.stage + 1} of ${matter.stages.length}, ${matter.stages[matter.stage]}`}>
        {matter.stages.map((s, i) => {
          const state = i < matter.stage ? "done" : i === matter.stage ? "current" : "todo";
          return (
            <li key={s} data-state={state} aria-current={state === "current" ? "step" : undefined}>
              <span className="ws-stages__dot" aria-hidden>
                {state === "done" && <Check size={10} strokeWidth={3} />}
              </span>
              <span className="ws-stages__label">{s}</span>
            </li>
          );
        })}
      </ol>
      <p className="ws-stages__note">Stages for {matter.type.toLowerCase()} matters — configurable by the firm.</p>
    </div>
  );
}

function InlineNote({ matterId, onClose }: { matterId: string; onClose: () => void }) {
  const ws = useWorkspace();
  const [text, setText] = useState("");
  return (
    <form
      className="ws-inlinenote"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        ws.addNote(matterId, text.trim());
        setText("");
        onClose();
      }}
    >
      <label htmlFor="inline-note">File note</label>
      <textarea id="inline-note" rows={3} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Record a decision, instruction or update…" />
      <div className="ws-form__actions">
        <button type="button" className="ws-btn ws-btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="ws-btn ws-btn--primary" disabled={!text.trim()}>
          Save to timeline
        </button>
      </div>
    </form>
  );
}

function Overview({
  matter,
  noteOpen,
  setNoteOpen,
  onTab,
}: {
  matter: Matter;
  noteOpen: boolean;
  setNoteOpen: (v: boolean) => void;
  onTab: (t: TabId) => void;
}) {
  const ws = useWorkspace();
  const { openLauncher } = useShell();
  const open = ws.tasks.filter((t) => t.matterId === matter.id && t.status === "open").sort((a, b) => a.due.localeCompare(b.due));
  const waiting = ws.waiting.filter((w) => w.matterId === matter.id && w.status === "waiting");
  const events = ws.activity.filter((e) => e.matterId === matter.id).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  const client = ws.lookup.client.get(matter.clientId);
  const people = [matter.responsibleId, ...matter.assistingIds].map((id) => ws.lookup.person.get(id)!);

  return (
    <div className="ws-overview">
      <div className="ws-overview__main">
        <section className="ws-card">
          <h2 className="ws-card__title">Where things stand</h2>
          <p className="ws-prose">{matter.summary}</p>
          <div className="ws-nextaction ws-nextaction--lg">
            <span>Next action</span>
            <p>{matter.nextAction}</p>
          </div>
          <Assist target="matter" id={matter.id} matterId={matter.id} />
        </section>

        {noteOpen && <InlineNote matterId={matter.id} onClose={() => setNoteOpen(false)} />}

        <section className="ws-card">
          <SectionTitle
            count={open.length}
            action={
              <button type="button" className="ws-linkbtn" onClick={() => openLauncher({ action: "task", matterId: matter.id })}>
                <Plus aria-hidden size={13} /> Add task
              </button>
            }
          >
            What needs to happen
          </SectionTitle>
          {open.length ? (
            <ul className="ws-tasklist" role="list">
              {open.map((t) => {
                const who = ws.lookup.person.get(t.assigneeId);
                return (
                  <li key={t.id}>
                    <button type="button" className="ws-checkbtn" aria-label={`Mark “${t.title}” complete`} onClick={() => ws.setTaskStatus(t.id, "done")}>
                      <Circle aria-hidden size={16} />
                    </button>
                    <span className="ws-tasklist__title">{t.title}</span>
                    <span className="ws-inline-person ws-tasklist__who">
                      <Avatar person={who} />
                      <span className="ws-sr">{who?.name}</span>
                    </span>
                    <Tag tone={dueTone(t.due)}>{formatDue(t.due)}</Tag>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={CheckCircle2} title="No open tasks">
              Add the next step so it appears in the responsible person’s work queue.
            </EmptyState>
          )}
        </section>

        {waiting.length > 0 && (
          <section className="ws-card">
            <SectionTitle count={waiting.length}>Outstanding from others</SectionTitle>
            <ul className="ws-tasklist" role="list">
              {waiting.map((w) => (
                <li key={w.id}>
                  <Hourglass aria-hidden size={15} className="ws-muted" />
                  <span className="ws-tasklist__title">
                    {w.title}
                    <span className="ws-muted">
                      {" "}
                      — {w.waitingOn}, since {formatDay(w.since)}
                      {w.expected && `; response requested by ${formatDay(w.expected)}`}
                    </span>
                  </span>
                  <button type="button" className="ws-btn ws-btn--sm" onClick={() => ws.chase(w.id)}>
                    Chase
                  </button>
                  <button type="button" className="ws-btn ws-btn--sm ws-btn--ghost" onClick={() => ws.markReceived(w.id)}>
                    Received
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="ws-overview__side" aria-label="Matter facts">
        <section className="ws-card">
          <h2 className="ws-card__title">People</h2>
          <ul className="ws-people" role="list">
            {client && (
              <li>
                <Avatar name={client.name} />
                <div>
                  <Link href={`/workspace/clients/${client.id}`}>{client.name}</Link>
                  <span>Client{client.contact ? ` · ${client.contact}` : ""}</span>
                </div>
              </li>
            )}
            {people.map((p, i) => (
              <li key={p.id}>
                <Avatar person={p} />
                <div>
                  <strong>{p.name}</strong>
                  <span>{i === 0 ? "Responsible" : "Assisting"} · {p.role}</span>
                </div>
              </li>
            ))}
            {matter.otherSide && (
              <li>
                <Avatar name={matter.otherSide.name} />
                <div>
                  <strong>{matter.otherSide.name}</strong>
                  <span>{matter.otherSide.role}</span>
                </div>
              </li>
            )}
          </ul>
        </section>

        <section className="ws-card">
          <h2 className="ws-card__title">Key dates</h2>
          {matter.keyDates.length ? (
            <ul className="ws-keydates" role="list">
              {matter.keyDates.map((k) => (
                <li key={k.label}>
                  <time>{formatDay(k.date)}</time>
                  <div>
                    <strong>{k.label}</strong>
                    <span>Source: {k.source}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ws-muted">No key dates recorded yet.</p>
          )}
        </section>

        <section className="ws-card">
          <SectionTitle
            action={
              <button type="button" className="ws-linkbtn" onClick={() => onTab("activity")}>
                All activity
              </button>
            }
          >
            Recent activity
          </SectionTitle>
          <Timeline events={events} dense />
        </section>
      </aside>
    </div>
  );
}

const ACTIVITY_FILTERS: { id: string; label: string; kinds: ActivityKind[] }[] = [
  { id: "all", label: "All", kinds: [] },
  { id: "comms", label: "Communications", kinds: ["message-in", "message-out", "call"] },
  { id: "notes", label: "Notes", kinds: ["note", "call"] },
  { id: "docs", label: "Documents", kinds: ["document"] },
  { id: "progress", label: "Tasks & status", kinds: ["task-done", "status", "event"] },
];

function ActivityTab({ matter }: { matter: Matter }) {
  const ws = useWorkspace();
  const [filter, setFilter] = useState("all");
  const [noteOpen, setNoteOpen] = useState(false);
  const kinds = ACTIVITY_FILTERS.find((f) => f.id === filter)!.kinds;
  const events = ws.activity.filter((e) => e.matterId === matter.id && (!kinds.length || kinds.includes(e.kind)));
  return (
    <div className="ws-activity">
      <div className="ws-activity__tools">
        <div className="ws-chips" role="group" aria-label="Filter activity">
          {ACTIVITY_FILTERS.map((f) => (
            <button key={f.id} type="button" className="ws-chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        {!noteOpen && (
          <button type="button" className="ws-btn ws-btn--sm" onClick={() => setNoteOpen(true)}>
            <NotebookPen aria-hidden size={14} /> Add note
          </button>
        )}
      </div>
      {noteOpen && <InlineNote matterId={matter.id} onClose={() => setNoteOpen(false)} />}
      {events.length ? <Timeline events={events} /> : <EmptyState icon={RotateCcw} title="No activity of this type" />}
    </div>
  );
}

export function DocumentsTab({ matterId, selected, onSelect }: { matterId: string; selected: string | null; onSelect: (id: string) => void }) {
  const ws = useWorkspace();
  const docs = ws.documents.filter((d) => d.matterId === matterId).sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  if (!docs.length) return <EmptyState icon={FileText} title="No documents yet">Documents emailed in or uploaded to this matter will appear here.</EmptyState>;
  return (
    <ul className="ws-doclist" role="list">
      {docs.map((d) => (
        <li key={d.id}>
          <button type="button" className="ws-docrow" aria-current={selected === d.id || undefined} onClick={() => onSelect(d.id)}>
            <FileText aria-hidden size={16} />
            <span className="ws-docrow__name">{d.name}</span>
            <Tag tone={docTone(d.status)}>{d.status}</Tag>
            <span className="ws-docrow__meta">
              {d.addedBy} · {formatShort(d.addedAt)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function TasksTab({ matter }: { matter: Matter }) {
  const ws = useWorkspace();
  const { openLauncher } = useShell();
  const tasks = ws.tasks.filter((t) => t.matterId === matter.id).sort((a, b) => a.due.localeCompare(b.due));
  const appts = ws.appointments.filter((a) => a.matterId === matter.id);
  const open = tasks.filter((t) => t.status === "open");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="ws-overview">
      <div className="ws-overview__main">
        <section className="ws-card">
          <SectionTitle
            count={open.length}
            action={
              <button type="button" className="ws-linkbtn" onClick={() => openLauncher({ action: "task", matterId: matter.id })}>
                <Plus aria-hidden size={13} /> Add task
              </button>
            }
          >
            Open tasks
          </SectionTitle>
          {open.length ? (
            <ul className="ws-tasklist" role="list">
              {open.map((t) => (
                <li key={t.id}>
                  <button type="button" className="ws-checkbtn" aria-label={`Mark “${t.title}” complete`} onClick={() => ws.setTaskStatus(t.id, "done")}>
                    <Circle aria-hidden size={16} />
                  </button>
                  <span className="ws-tasklist__title">
                    {t.title}
                    <span className="ws-muted"> — {ws.lookup.person.get(t.assigneeId)?.name}</span>
                  </span>
                  <Tag tone={dueTone(t.due)}>{formatDue(t.due)}</Tag>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CheckCircle2} title="All tasks complete" />
          )}
        </section>
        {done.length > 0 && (
          <section className="ws-card">
            <SectionTitle count={done.length}>Completed</SectionTitle>
            <ul className="ws-tasklist" role="list">
              {done.map((t) => (
                <li key={t.id} data-done>
                  <button type="button" className="ws-checkbtn" aria-label={`Reopen “${t.title}”`} aria-pressed onClick={() => ws.setTaskStatus(t.id, "open")}>
                    <CheckCircle2 aria-hidden size={16} />
                  </button>
                  <span className="ws-tasklist__title">{t.title}</span>
                  <Tag tone="done">Done</Tag>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <aside className="ws-overview__side">
        <section className="ws-card">
          <h2 className="ws-card__title">Deadlines and appointments</h2>
          <ul className="ws-keydates" role="list">
            {[
              ...matter.keyDates.map((k) => ({ key: k.label, date: k.date, title: k.label, sub: `Source: ${k.source}` })),
              ...appts.map((a) => ({ key: a.id, date: a.start, title: a.title, sub: `${timeOf(a.start)} · ${a.location}` })),
            ]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((k) => (
                <li key={k.key}>
                  <time>{formatDay(k.date)}</time>
                  <div>
                    <strong>{k.title}</strong>
                    <span>{k.sub}</span>
                  </div>
                </li>
              ))}
          </ul>
          <p className="ws-field__hint">Dates are recorded by the fee earner. The system doesn’t calculate legal deadlines.</p>
        </section>
      </aside>
    </div>
  );
}

function CommsTab({ matterId }: { matterId: string }) {
  const ws = useWorkspace();
  const convos = ws.conversations.filter((c) => c.matterId === matterId);
  if (!convos.length) return <EmptyState icon={MessageSquare} title="No linked conversations">Link a conversation to this matter from the Inbox.</EmptyState>;
  return (
    <ul className="ws-commslist" role="list">
      {convos.map((c) => {
        const last = c.messages[c.messages.length - 1];
        return (
          <li key={c.id}>
            <Link href={`/workspace/inbox?c=${c.id}`} className="ws-commsrow">
              <ChannelMark channel={c.channel} withLabel />
              <span className="ws-commsrow__body">
                <strong>{c.contactName}</strong> — {c.subject}
                <span className="ws-commsrow__preview">{last.body}</span>
              </span>
              <span className="ws-commsrow__meta">
                <time>{formatStamp(last.sentAt)}</time>
                <span>{c.messages.length} messages</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
