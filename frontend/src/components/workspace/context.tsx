"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  FileText,
  Mail,
  MessageSquareText,
  NotebookPen,
  Phone,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  StickyNote,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { ActivityEvent, ActivityKind, Conversation, LegalDocument, MatterType } from "@/types/workspace";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { Avatar, Facts, MatterRef, SectionTitle, Tag, type Tone } from "@/components/workspace/ui";
import { dayDiff, formatDay, formatDue, formatStamp } from "@/lib/workspace/dates";

/* Shared helpers ------------------------------------------------------------- */

export function dueTone(due: string): Tone {
  const d = dayDiff(due);
  return d < 0 ? "urgent" : d === 0 ? "attention" : "neutral";
}

export function statusTone(status: string): Tone {
  if (status === "Completed") return "done";
  if (status === "Awaiting client" || status === "On hold") return "attention";
  if (status === "Enquiry") return "accent";
  return "neutral";
}

const ACTIVITY_ICON: Record<ActivityKind, LucideIcon> = {
  "message-in": Mail,
  "message-out": MessageSquareText,
  note: StickyNote,
  document: FileText,
  "task-done": CheckCircle2,
  status: RefreshCw,
  event: CalendarClock,
  call: Phone,
};

const ACTIVITY_LABEL: Record<ActivityKind, string> = {
  "message-in": "Received",
  "message-out": "Sent",
  note: "Note",
  document: "Document",
  "task-done": "Task",
  status: "Status",
  event: "Event",
  call: "Call",
};

/* Timeline ------------------------------------------------------------------ */

export function Timeline({ events, showMatter = false, dense = false }: { events: ActivityEvent[]; showMatter?: boolean; dense?: boolean }) {
  const ws = useWorkspace();
  const sorted = [...events].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <ol className={`ws-timeline${dense ? " ws-timeline--dense" : ""}`}>
      {sorted.map((e, i) => {
        const Icon = ACTIVITY_ICON[e.kind];
        const label = formatDay(e.at);
        const heading = !dense && (i === 0 || formatDay(sorted[i - 1].at) !== label) ? label : null;
        const matter = ws.lookup.matter.get(e.matterId);
        return (
          <li key={e.id} className={`ws-event ws-event--${e.kind}`}>
            {heading && <div className="ws-event__day">{heading}</div>}
            <div className="ws-event__row">
              <span className="ws-event__icon" aria-hidden>
                <Icon size={13} />
              </span>
              <div className="ws-event__body">
                <p className="ws-event__title">
                  <span className="ws-event__kind">{ACTIVITY_LABEL[e.kind]}</span>
                  {e.title}
                </p>
                {e.detail && <p className="ws-event__detail">{e.detail}</p>}
                <p className="ws-event__meta">
                  {e.actor} · <time>{dense ? formatStamp(e.at) : formatStamp(e.at).split(", ")[1] ?? formatStamp(e.at)}</time>
                  {showMatter && matter && (
                    <>
                      {" · "}
                      <MatterRef id={matter.id} refText={matter.ref} />
                    </>
                  )}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* Matter brief: the context that travels with any item tied to a matter ---- */

export function MatterBrief({ matterId, heading = "Matter" }: { matterId: string; heading?: string }) {
  const ws = useWorkspace();
  const matter = ws.lookup.matter.get(matterId);
  if (!matter) return null;
  const client = ws.lookup.client.get(matter.clientId);
  const responsible = ws.lookup.person.get(matter.responsibleId);
  const open = ws.tasks.filter((t) => t.matterId === matterId && t.status === "open").sort((a, b) => a.due.localeCompare(b.due));
  const recent = ws.activity.filter((e) => e.matterId === matterId).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 3);
  const waitingOn = ws.waiting.filter((w) => w.matterId === matterId && w.status === "waiting");

  return (
    <section className="ws-brief" aria-label={`${heading}: ${matter.ref}`}>
      <p className="ws-brief__eyebrow">{heading}</p>
      <div className="ws-brief__title">
        <MatterRef id={matter.id} refText={matter.ref} />
        <Tag tone={statusTone(matter.status)}>{matter.status}</Tag>
      </div>
      <Link href={`/workspace/matters/${matter.id}`} className="ws-brief__name">
        {matter.title}
      </Link>
      <Facts
        items={[
          { label: "Client", value: client ? <Link href={`/workspace/clients/${client.id}`}>{client.name}</Link> : "—" },
          { label: "Type", value: matter.type },
          {
            label: "Responsible",
            value: (
              <span className="ws-inline-person">
                <Avatar person={responsible} /> {responsible?.name}
              </span>
            ),
          },
          { label: "Stage", value: `${matter.stages[matter.stage]} (${matter.stage + 1} of ${matter.stages.length})` },
        ]}
      />
      <div className="ws-nextaction">
        <span>Next action</span>
        <p>{matter.nextAction}</p>
      </div>

      {open.length > 0 && (
        <>
          <SectionTitle count={open.length}>Outstanding tasks</SectionTitle>
          <ul className="ws-mini" role="list">
            {open.slice(0, 4).map((t) => (
              <li key={t.id}>
                <button type="button" className="ws-checkbtn" aria-label={`Mark “${t.title}” complete`} onClick={() => ws.setTaskStatus(t.id, "done")}>
                  <Circle aria-hidden size={15} />
                </button>
                <span className="ws-mini__text">{t.title}</span>
                <Tag tone={dueTone(t.due)} icon={false}>
                  {dayDiff(t.due) < 0 ? formatDue(t.due) : formatDay(t.due)}
                </Tag>
              </li>
            ))}
          </ul>
        </>
      )}

      {waitingOn.length > 0 && (
        <>
          <SectionTitle count={waitingOn.length}>Waiting on</SectionTitle>
          <ul className="ws-mini" role="list">
            {waitingOn.map((w) => (
              <li key={w.id}>
                <span className="ws-mini__text">
                  {w.title} <span className="ws-muted">— {w.waitingOn}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <SectionTitle
        action={
          <Link href={`/workspace/matters/${matter.id}?tab=activity`} className="ws-linkbtn">
            All activity
          </Link>
        }
      >
        Recent activity
      </SectionTitle>
      <Timeline events={recent} dense />

      <Link href={`/workspace/matters/${matter.id}`} className="ws-btn ws-btn--block">
        Open matter workspace <ArrowUpRight aria-hidden size={14} />
      </Link>
    </section>
  );
}

/* Client brief --------------------------------------------------------------- */

export function ClientBrief({ clientId }: { clientId: string }) {
  const ws = useWorkspace();
  const client = ws.lookup.client.get(clientId);
  if (!client) return null;
  const matters = ws.matters.filter((m) => m.clientId === clientId);
  return (
    <section className="ws-brief" aria-label={`Client: ${client.name}`}>
      <p className="ws-brief__eyebrow">Client</p>
      <div className="ws-clienthead">
        <Avatar name={client.name} size="lg" />
        <div>
          <Link href={`/workspace/clients/${client.id}`} className="ws-brief__name">
            {client.name}
          </Link>
          <p className="ws-muted">{client.contact ?? `${client.kind} client`} · since {formatDay(client.clientSince)}</p>
        </div>
      </div>
      <Facts
        items={[
          { label: "Email", value: <a href={`mailto:${client.email}`}>{client.email}</a> },
          { label: "Phone", value: <a href={`tel:${client.phone.replace(/\s/g, "")}`}>{client.phone}</a> },
          {
            label: "ID check",
            value:
              client.idCheck.status === "Verified" ? (
                <Tag tone="done">Verified {client.idCheck.date && formatDay(client.idCheck.date)}</Tag>
              ) : (
                <Tag tone="attention">Outstanding</Tag>
              ),
          },
          {
            label: "Matters",
            value: (
              <span className="ws-reflist">
                {matters.map((m) => (
                  <MatterRef key={m.id} id={m.id} refText={m.ref} />
                ))}
              </span>
            ),
          },
        ]}
      />
      {client.notes && <p className="ws-brief__note">{client.notes}</p>}
    </section>
  );
}

/* Prospect brief: handle a new enquiry without leaving the conversation ------ */

const TYPES: MatterType[] = ["Property", "Family", "Civil dispute", "Wills & estates"];

export function ProspectBrief({ conversation }: { conversation: Conversation }) {
  const ws = useWorkspace();
  const [names, setNames] = useState(conversation.contactName);
  const [checked, setChecked] = useState<null | { term: string; hits: string[] }>(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [created, setCreated] = useState<{ id: string; ref: string } | null>(null);
  const [form, setForm] = useState({
    name: conversation.contactName,
    email: conversation.contactDetail.match(/\S+@\S+/)?.[0] ?? "",
    phone: conversation.contactDetail.match(/0\d[\d ]{8,}/)?.[0]?.trim() ?? "",
    matterTitle: conversation.subject,
    matterType: (conversation.subject.toLowerCase().includes("will") ? "Wills & estates" : "Civil dispute") as MatterType,
    responsibleId: conversation.assigneeId ?? ws.me.id,
  });

  const runCheck = () => {
    const terms = names.split(/[,;\n]/).map((t) => t.trim().toLowerCase()).filter(Boolean);
    const hits: string[] = [];
    for (const term of terms) {
      const surname = term.split(" ").pop() ?? term;
      ws.clients.forEach((c) => {
        if (c.name.toLowerCase().includes(surname)) hits.push(`“${term}” — similar to client ${c.name}`);
      });
      ws.matters.forEach((m) => {
        if (m.otherSide?.name.toLowerCase().includes(surname)) hits.push(`“${term}” — other side on ${m.ref} (${m.otherSide.name})`);
      });
    }
    setChecked({ term: names, hits });
  };

  const assignee = conversation.assigneeId ? ws.lookup.person.get(conversation.assigneeId) : null;

  return (
    <section className="ws-brief" aria-label="New enquiry">
      <p className="ws-brief__eyebrow">New enquiry · not yet a client</p>
      <div className="ws-clienthead">
        <Avatar name={conversation.contactName} size="lg" />
        <div>
          <p className="ws-brief__name">{conversation.contactName}</p>
          <p className="ws-muted">{conversation.contactDetail}</p>
        </div>
      </div>

      <ol className="ws-steps">
        <li data-done={!!assignee || undefined}>
          <div className="ws-steps__head">
            <span className="ws-steps__n">1</span>
            <strong>Owner</strong>
            {assignee && <span className="ws-muted">{assignee.name}</span>}
          </div>
          {!assignee && (
            <button type="button" className="ws-btn ws-btn--sm" onClick={() => { ws.updateConversation(conversation.id, { assigneeId: ws.me.id }); ws.toast({ message: "Enquiry assigned to you", tone: "success" }); }}>
              Assign to me
            </button>
          )}
        </li>
        <li data-done={(checked && !checked.hits.length) || undefined}>
          <div className="ws-steps__head">
            <span className="ws-steps__n">2</span>
            <strong>Conflict check</strong>
          </div>
          <label className="ws-field__label" htmlFor={`conflict-${conversation.id}`}>
            Names to check (enquirer and any other parties)
          </label>
          <div className="ws-inlineform">
            <input id={`conflict-${conversation.id}`} value={names} onChange={(e) => setNames(e.target.value)} placeholder="Separate names with commas" />
            <button type="button" className="ws-btn ws-btn--sm" onClick={runCheck}>
              Check
            </button>
          </div>
          {checked &&
            (checked.hits.length ? (
              <div className="ws-callout ws-callout--attention" role="status">
                <ShieldAlert aria-hidden size={15} />
                <div>
                  <strong>Possible match — review before proceeding</strong>
                  <ul role="list">
                    {checked.hits.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="ws-callout ws-callout--done" role="status">
                <ShieldCheck aria-hidden size={15} />
                <span>No matches in client or other-party records. Record this in the file when you open the matter.</span>
              </div>
            ))}
        </li>
        <li data-done={!!created || undefined}>
          <div className="ws-steps__head">
            <span className="ws-steps__n">3</span>
            <strong>Open client and matter</strong>
          </div>
          {created ? (
            <div className="ws-callout ws-callout--done">
              <CheckCircle2 aria-hidden size={15} />
              <span>
                Opened <MatterRef id={created.id} refText={created.ref} /> and linked this conversation.
              </span>
            </div>
          ) : intakeOpen ? (
            <form
              className="ws-form ws-form--tight"
              onSubmit={(e) => {
                e.preventDefault();
                const matter = ws.intake({ conversationId: conversation.id, ...form });
                setCreated({ id: matter.id, ref: matter.ref });
                ws.toast({ message: `Opened ${matter.ref} for ${form.name}`, tone: "success" });
              }}
            >
              {(
                [
                  ["name", "Client name"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["matterTitle", "Matter title"],
                ] as const
              ).map(([key, label]) => (
                <div className="ws-field" key={key}>
                  <label htmlFor={`intake-${key}`}>{label}</label>
                  <input id={`intake-${key}`} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={key === "name" || key === "matterTitle"} />
                </div>
              ))}
              <div className="ws-form__row">
                <div className="ws-field">
                  <label htmlFor="intake-type">Matter type</label>
                  <select id="intake-type" value={form.matterType} onChange={(e) => setForm({ ...form, matterType: e.target.value as MatterType })}>
                    {TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="ws-field">
                  <label htmlFor="intake-resp">Responsible</label>
                  <select id="intake-resp" value={form.responsibleId} onChange={(e) => setForm({ ...form, responsibleId: e.target.value })}>
                    {ws.team.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="ws-field__hint">Opens with status “Enquiry”. ID verification and client care letter are added as outstanding.</p>
              <div className="ws-form__actions">
                <button type="button" className="ws-btn ws-btn--ghost" onClick={() => setIntakeOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="ws-btn ws-btn--primary">
                  Open matter
                </button>
              </div>
            </form>
          ) : (
            <button type="button" className="ws-btn ws-btn--sm" onClick={() => setIntakeOpen(true)}>
              <UserPlus aria-hidden size={14} /> Create client &amp; matter
            </button>
          )}
        </li>
      </ol>
      <p className="ws-field__hint">
        <NotebookPen aria-hidden size={12} className="ws-inline-icon" /> Or link to an existing matter from the conversation menu.
      </p>
    </section>
  );
}

/* Document preview -------------------------------------------------------------- */

export function DocumentPreview({ doc, actions }: { doc: LegalDocument; actions?: React.ReactNode }) {
  const ws = useWorkspace();
  const matter = ws.lookup.matter.get(doc.matterId);
  return (
    <section className="ws-docpreview" aria-label={`Preview of ${doc.name}`}>
      <header className="ws-docpreview__head">
        <FileText aria-hidden size={18} />
        <div>
          <h3>{doc.name}</h3>
          <p className="ws-muted">
            {matter && <MatterRef id={matter.id} refText={matter.ref} />} · {doc.pages} page{doc.pages > 1 ? "s" : ""} · {doc.size} · added by {doc.addedBy},{" "}
            {formatStamp(doc.addedAt)}
          </p>
        </div>
      </header>
      {actions && <div className="ws-docpreview__actions">{actions}</div>}
      <div className="ws-paper" role="document" aria-label="Page 1">
        {doc.preview.map((line, i) => (
          <p key={i} className={i === 0 ? "ws-paper__title" : undefined}>
            {line}
          </p>
        ))}
        <div className="ws-paper__fade" aria-hidden />
      </div>
      <p className="ws-field__hint">Preview shows page 1 of {doc.pages}. Mock document — no file storage is connected.</p>
    </section>
  );
}

export function docTone(status: LegalDocument["status"]): Tone {
  if (status === "Awaiting review") return "attention";
  if (status === "Final") return "done";
  if (status === "Draft") return "accent";
  return "neutral";
}

