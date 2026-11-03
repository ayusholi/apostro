"use client";

import Link from "next/link";
import { useState } from "react";
import { Briefcase, FileText, Search, Users } from "lucide-react";
import type { DocumentStatus, MatterType } from "@/types/workspace";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { DocumentPreview, docTone, statusTone } from "@/components/workspace/context";
import { Avatar, ContextPanel, EmptyState, Tag } from "@/components/workspace/ui";
import { formatShort } from "@/lib/workspace/dates";

function SearchField({ id, value, onChange, label }: { id: string; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="ws-searchfield">
      <Search aria-hidden size={14} />
      <label htmlFor={id} className="ws-sr">
        {label}
      </label>
      <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} />
    </div>
  );
}

const TYPES: (MatterType | "All")[] = ["All", "Property", "Family", "Civil dispute", "Wills & estates"];

export function MattersList() {
  const ws = useWorkspace();
  const [mine, setMine] = useState(true);
  const [type, setType] = useState<MatterType | "All">("All");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = ws.matters
    .filter((m) => !mine || m.responsibleId === ws.me.id || m.assistingIds.includes(ws.me.id))
    .filter((m) => type === "All" || m.type === type)
    .filter((m) => !q || [m.ref, m.title, ws.lookup.client.get(m.clientId)?.name ?? ""].some((t) => t.toLowerCase().includes(q)))
    .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));

  return (
    <div className="ws-page">
      <header className="ws-pagehead">
        <div>
          <h1>Matters</h1>
          <p className="ws-pagehead__sub">{rows.length} shown · sorted by most recent activity</p>
        </div>
      </header>
      <div className="ws-filters">
        <div className="ws-segmented" role="tablist" aria-label="Whose matters">
          <button type="button" role="tab" aria-selected={mine} onClick={() => setMine(true)}>
            My matters
          </button>
          <button type="button" role="tab" aria-selected={!mine} onClick={() => setMine(false)}>
            All matters
          </button>
        </div>
        <label className="ws-select-inline">
          <span className="ws-sr">Matter type</span>
          <select value={type} onChange={(e) => setType(e.target.value as MatterType | "All")}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All types" : t}
              </option>
            ))}
          </select>
        </label>
        <SearchField id="matter-search" value={query} onChange={setQuery} label="Filter matters" />
      </div>
      {rows.length ? (
        <div className="ws-table" role="table" aria-label="Matters">
          <div className="ws-table__head" role="row">
            <span role="columnheader">Matter</span>
            <span role="columnheader">Client</span>
            <span role="columnheader">Stage</span>
            <span role="columnheader">Next action</span>
            <span role="columnheader">Responsible</span>
            <span role="columnheader">Activity</span>
          </div>
          {rows.map((m) => {
            const resp = ws.lookup.person.get(m.responsibleId);
            return (
              <Link key={m.id} href={`/workspace/matters/${m.id}`} className="ws-table__row" role="row">
                <span role="cell" className="ws-table__primary">
                  <span className="ws-ref">{m.ref}</span>
                  <strong>{m.title}</strong>
                </span>
                <span role="cell">{ws.lookup.client.get(m.clientId)?.name}</span>
                <span role="cell" className="ws-table__stack">
                  <Tag tone={statusTone(m.status)}>{m.status}</Tag>
                  <span className="ws-muted">{m.stages[m.stage]}</span>
                </span>
                <span role="cell" className="ws-table__next">{m.nextAction}</span>
                <span role="cell" className="ws-inline-person">
                  <Avatar person={resp} /> <span className="ws-hide-md">{resp?.name}</span>
                </span>
                <span role="cell" className="ws-muted">{formatShort(m.lastActivity)}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Briefcase} title="No matching matters">
          Try “All matters” or clear the filters.
        </EmptyState>
      )}
    </div>
  );
}

export function ClientsList() {
  const ws = useWorkspace();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = ws.clients
    .filter((c) => !q || [c.name, c.email, c.contact ?? ""].some((t) => t.toLowerCase().includes(q)))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="ws-page">
      <header className="ws-pagehead">
        <div>
          <h1>Clients</h1>
          <p className="ws-pagehead__sub">{ws.clients.length} clients · prospective clients appear in the Inbox until a matter is opened</p>
        </div>
      </header>
      <div className="ws-filters">
        <SearchField id="client-search" value={query} onChange={setQuery} label="Filter clients" />
      </div>
      {rows.length ? (
        <div className="ws-table ws-table--clients" role="table" aria-label="Clients">
          <div className="ws-table__head" role="row">
            <span role="columnheader">Client</span>
            <span role="columnheader">Matters</span>
            <span role="columnheader">Contact</span>
            <span role="columnheader">ID check</span>
          </div>
          {rows.map((c) => {
            const matters = ws.matters.filter((m) => m.clientId === c.id);
            return (
              <Link key={c.id} href={`/workspace/clients/${c.id}`} className="ws-table__row" role="row">
                <span role="cell" className="ws-table__primary ws-table__primary--row">
                  <Avatar name={c.name} size="md" />
                  <span>
                    <strong>{c.name}</strong>
                    <span className="ws-muted">{c.contact ?? `${c.kind} client`}</span>
                  </span>
                </span>
                <span role="cell" className="ws-reflist">
                  {matters.map((m) => (
                    <span key={m.id} className="ws-ref">
                      {m.ref}
                    </span>
                  ))}
                </span>
                <span role="cell" className="ws-muted">{c.email}</span>
                <span role="cell">
                  {c.idCheck.status === "Verified" ? <Tag tone="done">Verified</Tag> : <Tag tone="attention">Outstanding</Tag>}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Users} title="No matching clients" />
      )}
    </div>
  );
}

const DOC_FILTERS: (DocumentStatus | "All")[] = ["All", "Awaiting review", "Draft", "From client", "From other side", "Final"];

export function DocumentsView({ initialId }: { initialId?: string }) {
  const ws = useWorkspace();
  const [selected, setSelected] = useState<string | null>(initialId ?? null);
  const [status, setStatus] = useState<DocumentStatus | "All">("All");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const rows = ws.documents
    .filter((d) => status === "All" || d.status === status)
    .filter((d) => !q || [d.name, ws.lookup.matter.get(d.matterId)?.ref ?? ""].some((t) => t.toLowerCase().includes(q)))
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  const doc = selected ? ws.lookup.document.get(selected) : undefined;
  const reviewTask = doc ? ws.tasks.find((t) => t.documentId === doc.id && t.status === "open") : undefined;

  return (
    <div className="ws-split">
      <div className="ws-page">
        <header className="ws-pagehead">
          <div>
            <h1>Documents</h1>
            <p className="ws-pagehead__sub">Across your matters · {ws.documents.filter((d) => d.status === "Awaiting review").length} awaiting review</p>
          </div>
        </header>
        <div className="ws-filters">
          <div className="ws-chips" role="group" aria-label="Document status">
            {DOC_FILTERS.map((s) => (
              <button key={s} type="button" className="ws-chip" aria-pressed={status === s} onClick={() => setStatus(s)}>
                {s}
              </button>
            ))}
          </div>
          <SearchField id="doc-search" value={query} onChange={setQuery} label="Filter documents" />
        </div>
        {rows.length ? (
          <ul className="ws-doclist" role="list">
            {rows.map((d) => {
              const m = ws.lookup.matter.get(d.matterId);
              return (
                <li key={d.id}>
                  <button type="button" className="ws-docrow" aria-current={selected === d.id || undefined} onClick={() => setSelected(d.id)}>
                    <FileText aria-hidden size={16} />
                    <span className="ws-docrow__name">
                      {d.name}
                      <span className="ws-docrow__matter">
                        {m?.ref} · {ws.lookup.client.get(m?.clientId ?? "")?.name}
                      </span>
                    </span>
                    <Tag tone={docTone(d.status)}>{d.status}</Tag>
                    <span className="ws-docrow__meta">
                      {d.addedBy} · {formatShort(d.addedAt)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState icon={FileText} title="No documents match">
            Clear the filter to see every document.
          </EmptyState>
        )}
      </div>
      <ContextPanel open={!!doc} onClose={() => setSelected(null)} label="Document preview" wide>
        {doc && (
          <DocumentPreview
            doc={doc}
            actions={
              <>
                {reviewTask && (
                  <button type="button" className="ws-btn ws-btn--primary" onClick={() => ws.setTaskStatus(reviewTask.id, "done")}>
                    Mark reviewed
                  </button>
                )}
                <Link href={`/workspace/matters/${doc.matterId}?tab=documents`} className="ws-btn">
                  Open matter
                </Link>
              </>
            }
          />
        )}
      </ContextPanel>
    </div>
  );
}
