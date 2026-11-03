"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Check, CheckCircle2, RotateCcw, Send } from "lucide-react";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { Composer, Thread } from "@/components/workspace/conversation";
import { Assist } from "@/components/workspace/assist";
import { ClientBrief, DocumentPreview, MatterBrief, ProspectBrief, dueTone } from "@/components/workspace/context";
import { NoteForm } from "@/components/workspace/forms";
import { Avatar, Facts, Tag } from "@/components/workspace/ui";
import { formatDay, formatDue, formatStamp } from "@/lib/workspace/dates";
import type { WorkItem } from "@/components/workspace/work/MyWork";

/** The context panel body for a selected work item: the item itself first,
    then the matter it belongs to, so nothing needs a second screen. */
export function WorkDetail({ item, mode, onDone }: { item: WorkItem; mode: "view" | "reply"; onDone: () => void }) {
  const ws = useWorkspace();
  const [draft, setDraft] = useState<{ text: string; n: number } | null>(null);
  const s = item.source;

  let body: React.ReactNode = null;
  let clientId: string | undefined;

  if (s.type === "conversation") {
    const c = ws.lookup.conversation.get(s.id);
    if (c) {
      clientId = c.clientId;
      body = (
        <>
          <Thread conversation={c} limit={2} />
          {c.state === "new" ? (
            <ProspectBrief conversation={c} />
          ) : (
            <>
              <Assist target="conversation" id={c.id} matterId={c.matterId} onDraft={(text) => setDraft({ text, n: (draft?.n ?? 0) + 1 })} compact />
              {(mode === "reply" || draft || item.kindLabel === "Reply owed") && (
                <Composer key={draft?.n ?? 0} conversation={c} draft={draft?.text} compact onSent={onDone} />
              )}
            </>
          )}
          <Link href={`/workspace/inbox?c=${c.id}`} className="ws-linkbtn ws-linkbtn--block">
            Open full conversation in Inbox <ArrowUpRight aria-hidden size={13} />
          </Link>
        </>
      );
    }
  } else if (s.type === "task") {
    const t = ws.tasks.find((x) => x.id === s.id);
    const doc = t?.documentId ? ws.lookup.document.get(t.documentId) : undefined;
    const assignee = t ? ws.lookup.person.get(t.assigneeId) : undefined;
    if (t) {
      const done = t.status === "done";
      const completeButton = (
        <button type="button" className={`ws-btn ${done ? "" : "ws-btn--primary"}`} onClick={() => ws.setTaskStatus(t.id, done ? "open" : "done")}>
          {done ? <RotateCcw aria-hidden size={14} /> : <Check aria-hidden size={14} />}
          {done ? "Reopen" : doc ? "Mark reviewed" : "Mark complete"}
        </button>
      );
      body = (
        <>
          <Facts
            items={[
              { label: "Due", value: done ? <Tag tone="done">Completed</Tag> : <Tag tone={dueTone(t.due)}>{formatDue(t.due)}</Tag> },
              {
                label: "Assigned",
                value: (
                  <span className="ws-inline-person">
                    <Avatar person={assignee} /> {assignee?.name}
                  </span>
                ),
              },
            ]}
          />
          {t.detail && t.detail !== item.reason && <p className="ws-detail__note">{t.detail}</p>}
          {doc && <DocumentPreview doc={doc} actions={completeButton} />}
          {!doc && t.kind === "follow-up" && !done && (
            <div className="ws-detail__block">
              <h4 className="ws-detail__subhead">Log the call</h4>
              <NoteForm matterId={t.matterId} autoFocus={mode === "reply"} onDone={() => ws.setTaskStatus(t.id, "done", { silent: true })} onCancel={onDone} />
            </div>
          )}
          {!doc && (t.kind !== "follow-up" || done) && <div className="ws-detail__actions">{completeButton}</div>}
        </>
      );
    }
  } else if (s.type === "waiting") {
    const w = ws.waiting.find((x) => x.id === s.id);
    if (w) {
      body = (
        <>
          <Facts
            items={[
              { label: "Waiting on", value: w.waitingOn },
              { label: "Requested", value: formatDay(w.since) },
              { label: "Last chased", value: w.lastChased ? formatDay(w.lastChased) : "Not yet" },
              ...(w.expected ? [{ label: "Response requested by", value: formatDay(w.expected) }] : []),
            ]}
          />
          <div className="ws-detail__actions">
            <button type="button" className="ws-btn" onClick={() => ws.chase(w.id)}>
              <Send aria-hidden size={14} /> Log a chaser
            </button>
            <button type="button" className="ws-btn ws-btn--primary" onClick={() => { ws.markReceived(w.id); onDone(); }}>
              <CheckCircle2 aria-hidden size={14} /> Mark received
            </button>
          </div>
        </>
      );
    }
  } else if (s.type === "appointment") {
    const a = ws.appointments.find((x) => x.id === s.id);
    if (a) {
      body = (
        <Facts
          items={[
            { label: "When", value: formatStamp(a.start) },
            { label: "Where", value: a.location },
            ...(a.with ? [{ label: "With", value: a.with }] : []),
          ]}
        />
      );
    }
  } else if (s.type === "keydate") {
    const m = ws.lookup.matter.get(s.matterId);
    const k = m?.keyDates.find((x) => x.label === s.label);
    if (k) {
      body = (
        <>
          <Facts
            items={[
              { label: "Date", value: formatDay(k.date) },
              { label: "Recorded from", value: k.source },
            ]}
          />
          <p className="ws-detail__note">Key dates are entered by the fee earner from source documents. Check the source before relying on them.</p>
        </>
      );
    }
  }

  return (
    <div className="ws-detail">
      <header className="ws-detail__head">
        <p className="ws-brief__eyebrow">
          <item.icon aria-hidden size={13} /> {item.kindLabel}
          {item.who && <> · {item.who}</>}
        </p>
        <h2 className="ws-detail__title">{item.title}</h2>
        <p className={`ws-row__reason ws-row__reason--${item.whenTone}`}>{item.reason}</p>
      </header>
      {body}
      {item.matterId ? <MatterBrief matterId={item.matterId} /> : clientId ? <ClientBrief clientId={clientId} /> : null}
    </div>
  );
}
