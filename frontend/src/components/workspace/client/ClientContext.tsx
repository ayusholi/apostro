"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Circle, FileText, Mail, MapPin, NotebookPen, Phone, Plus, Send, ShieldCheck, ShieldAlert, Users } from "lucide-react";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { useShell } from "@/components/workspace/shell/ShellContext";
import { DocumentPreview, Timeline, docTone, dueTone, statusTone } from "@/components/workspace/context";
import { ActionMenu, Avatar, ChannelMark, ContextPanel, EmptyState, SectionTitle, Tag, channelLabel } from "@/components/workspace/ui";
import { formatDay, formatDue, formatFullDate, formatShort } from "@/lib/workspace/dates";

export function ClientContext({ id }: { id: string }) {
  const ws = useWorkspace();
  const router = useRouter();
  const { openLauncher } = useShell();
  const client = ws.lookup.client.get(id);
  const [docId, setDocId] = useState<string | null>(null);

  const { touchDesk } = ws;
  const found = Boolean(client);
  useEffect(() => {
    if (found) touchDesk({ kind: "client", id });
  }, [found, id, touchDesk]);

  if (!client) {
    return (
      <div className="ws-page">
        <EmptyState icon={Users} title="Client not found" action={<Link href="/workspace/clients" className="ws-btn">Back to clients</Link>}>
          Prototype data resets when the page reloads.
        </EmptyState>
      </div>
    );
  }

  const matters = ws.matters.filter((m) => m.clientId === id);
  const matterIds = new Set(matters.map((m) => m.id));
  const convos = ws.conversations.filter((c) => c.clientId === id).sort((a, b) => b.messages[b.messages.length - 1].sentAt.localeCompare(a.messages[a.messages.length - 1].sentAt));
  const tasks = ws.tasks.filter((t) => t.matterId && matterIds.has(t.matterId) && t.status === "open").sort((a, b) => a.due.localeCompare(b.due));
  const docs = ws.documents.filter((d) => matterIds.has(d.matterId)).sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  const history = ws.activity.filter((e) => matterIds.has(e.matterId));
  const doc = docId ? ws.lookup.document.get(docId) : undefined;
  const primaryMatter = matters[0];

  return (
    <div className="ws-split">
      <div className="ws-page ws-page--client">
        <nav className="ws-crumbs" aria-label="Breadcrumb">
          <Link href="/workspace/clients">Clients</Link>
          <ChevronRight aria-hidden size={13} />
          <span aria-current="page">{client.name}</span>
        </nav>

        <header className="ws-clientpage__head">
          <Avatar name={client.name} size="lg" />
          <div className="ws-clientpage__id">
            <h1>{client.name}</h1>
            <p className="ws-muted">
              {client.kind} client{client.contact && ` · ${client.contact}`} · since {formatFullDate(client.clientSince)} · {matters.length} matter{matters.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="ws-matterhead__actions">
            <button type="button" className="ws-btn" onClick={() => openLauncher({ action: "note", matterId: primaryMatter?.id })}>
              <NotebookPen aria-hidden size={15} /> Add note
            </button>
            <button type="button" className="ws-btn" onClick={() => openLauncher({ action: "task", matterId: primaryMatter?.id })}>
              <Plus aria-hidden size={15} /> Task
            </button>
            <ActionMenu
              label="Contact client"
              className="ws-btn ws-btn--primary"
              trigger={
                <>
                  <Send aria-hidden size={15} /> Contact
                </>
              }
              items={[
                ...(convos[0] ? [{ label: `Continue ${channelLabel(convos[0].channel)} conversation`, icon: Send, onSelect: () => router.push(`/workspace/inbox?c=${convos[0].id}`) }] : []),
                { label: `Email ${client.email}`, icon: Mail, onSelect: () => window.location.assign(`mailto:${client.email}`) },
                { label: `Call ${client.phone}`, icon: Phone, onSelect: () => window.location.assign(`tel:${client.phone.replace(/\s/g, "")}`) },
              ]}
            />
          </div>
        </header>

        <div className="ws-overview">
          <div className="ws-overview__main">
            <section className="ws-card">
              <SectionTitle count={matters.length}>Matters</SectionTitle>
              <ul className="ws-mattercards" role="list">
                {matters.map((m) => {
                  const resp = ws.lookup.person.get(m.responsibleId);
                  return (
                    <li key={m.id}>
                      <Link href={`/workspace/matters/${m.id}`} className="ws-mattercard">
                        <span className="ws-mattercard__top">
                          <span className="ws-ref">{m.ref}</span>
                          <Tag tone={statusTone(m.status)}>{m.status}</Tag>
                          <span className="ws-mattercard__stage">{m.stages[m.stage]}</span>
                        </span>
                        <strong className="ws-mattercard__title">{m.title}</strong>
                        <span className="ws-mattercard__next">
                          <span>Next:</span> {m.nextAction}
                        </span>
                        <span className="ws-mattercard__meta">
                          <Avatar person={resp} /> {resp?.name} · last activity {formatShort(m.lastActivity)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="ws-card">
              <SectionTitle count={tasks.length}>Outstanding tasks</SectionTitle>
              {tasks.length ? (
                <ul className="ws-tasklist" role="list">
                  {tasks.map((t) => (
                    <li key={t.id}>
                      <button type="button" className="ws-checkbtn" aria-label={`Mark “${t.title}” complete`} onClick={() => ws.setTaskStatus(t.id, "done")}>
                        <Circle aria-hidden size={16} />
                      </button>
                      <span className="ws-tasklist__title">
                        {t.title} <span className="ws-ref">{ws.lookup.matter.get(t.matterId!)?.ref}</span>
                      </span>
                      <Tag tone={dueTone(t.due)}>{formatDue(t.due)}</Tag>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={Circle} title="Nothing outstanding for this client" />
              )}
            </section>

            <section className="ws-card">
              <SectionTitle>History</SectionTitle>
              <Timeline events={history} showMatter />
            </section>
          </div>

          <aside className="ws-overview__side" aria-label="Client details">
            <section className="ws-card">
              <h2 className="ws-card__title">Contact</h2>
              <ul className="ws-contactlist" role="list">
                <li>
                  <Mail aria-hidden size={14} /> <a href={`mailto:${client.email}`}>{client.email}</a>
                </li>
                <li>
                  <Phone aria-hidden size={14} /> <a href={`tel:${client.phone.replace(/\s/g, "")}`}>{client.phone}</a>
                </li>
                <li>
                  <MapPin aria-hidden size={14} /> {client.address}
                </li>
                <li>
                  <ChannelMark channel={client.preferredChannel} /> Prefers {channelLabel(client.preferredChannel).toLowerCase()}
                </li>
              </ul>
              <div className={`ws-callout ws-callout--${client.idCheck.status === "Verified" ? "done" : "attention"}`}>
                {client.idCheck.status === "Verified" ? <ShieldCheck aria-hidden size={15} /> : <ShieldAlert aria-hidden size={15} />}
                <span>
                  {client.idCheck.status === "Verified"
                    ? `ID verified ${client.idCheck.date ? formatDay(client.idCheck.date) : ""}`
                    : "ID verification outstanding"}
                </span>
              </div>
              {client.notes && <p className="ws-brief__note">{client.notes}</p>}
            </section>

            <section className="ws-card">
              <SectionTitle count={convos.length}>Conversations</SectionTitle>
              {convos.length ? (
                <ul className="ws-compactlist" role="list">
                  {convos.map((c) => (
                    <li key={c.id}>
                      <Link href={`/workspace/inbox?c=${c.id}`}>
                        <ChannelMark channel={c.channel} />
                        <span className="ws-compactlist__text">{c.subject}</span>
                        <time>{formatShort(c.messages[c.messages.length - 1].sentAt)}</time>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ws-muted">No conversations yet.</p>
              )}
            </section>

            <section className="ws-card">
              <SectionTitle count={docs.length}>Documents</SectionTitle>
              <ul className="ws-compactlist" role="list">
                {docs.slice(0, 6).map((d) => (
                  <li key={d.id}>
                    <button type="button" onClick={() => setDocId(d.id)} aria-current={docId === d.id || undefined}>
                      <FileText aria-hidden size={14} />
                      <span className="ws-compactlist__text">{d.name}</span>
                      <Tag tone={docTone(d.status)} icon={false}>
                        {d.status}
                      </Tag>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>

      <ContextPanel open={!!doc} onClose={() => setDocId(null)} label="Document preview" wide>
        {doc && <DocumentPreview doc={doc} />}
      </ContextPanel>
    </div>
  );
}
