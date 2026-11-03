"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Briefcase,
  Hourglass,
  Inbox as InboxIcon,
  Link2,
  MessagesSquare,
  PanelRight,
  Search,
  UserRound,
  UserRoundX,
  type LucideIcon,
} from "lucide-react";
import type { Channel, Conversation } from "@/types/workspace";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { Composer, Thread } from "@/components/workspace/conversation";
import { Assist } from "@/components/workspace/assist";
import { ClientBrief, MatterBrief, ProspectBrief } from "@/components/workspace/context";
import { ActionMenu, Avatar, ChannelMark, ContextPanel, EmptyState, Tag, type MenuItem } from "@/components/workspace/ui";
import { formatShort } from "@/lib/workspace/dates";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/** Below this width the context panel would squeeze the thread, so it becomes a drawer. */
const DRAWER_QUERY = "(max-width: 1359px)";

type Folder = "all" | "unassigned" | "mine" | "awaiting" | "archived";

const FOLDERS: { id: Folder; label: string; icon: LucideIcon }[] = [
  { id: "all", label: "All conversations", icon: MessagesSquare },
  { id: "unassigned", label: "Unassigned", icon: UserRoundX },
  { id: "mine", label: "Assigned to me", icon: UserRound },
  { id: "awaiting", label: "Awaiting response", icon: Hourglass },
  { id: "archived", label: "Archived", icon: Archive },
];

const CHANNELS: { id: Channel | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "web", label: "Web" },
];

export function Inbox({ initialId }: { initialId?: string }) {
  const ws = useWorkspace();
  const [folder, setFolder] = useState<Folder>("all");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialId ?? "okafor");
  const [mobileView, setMobileView] = useState<"list" | "thread">(initialId ? "thread" : "list");
  // Open by default only where it fits as a column; on narrower screens it's a
  // drawer, so wait for the user to ask for it.
  const [contextChoice, setContextChoice] = useState<boolean | null>(null);
  const narrow = useMediaQuery(DRAWER_QUERY);
  const contextOpen = contextChoice ?? !narrow;
  const setContextOpen = (open: boolean) => setContextChoice(open);

  const { updateConversation } = ws;
  useEffect(() => {
    if (initialId) updateConversation(initialId, { unread: false });
  }, [initialId, updateConversation]);

  const inFolder = (c: Conversation, f: Folder) => {
    if (f === "archived") return c.state === "archived";
    if (c.state === "archived") return false;
    if (f === "unassigned") return !c.assigneeId;
    if (f === "mine") return c.assigneeId === ws.me.id;
    if (f === "awaiting") return c.state === "awaiting" || c.state === "new";
    return true;
  };

  const q = query.trim().toLowerCase();
  const list = ws.conversations
    .filter((c) => inFolder(c, folder))
    .filter((c) => channel === "all" || c.channel === channel)
    .filter((c) => !q || [c.contactName, c.subject, ...c.messages.map((m) => m.body)].some((t) => t.toLowerCase().includes(q)))
    .sort((a, b) => b.messages[b.messages.length - 1].sentAt.localeCompare(a.messages[a.messages.length - 1].sentAt));

  const selected = selectedId ? ws.lookup.conversation.get(selectedId) : undefined;

  const folderCount = (f: Folder) =>
    f === "archived" ? 0 : ws.conversations.filter((c) => inFolder(c, f) && (c.unread || c.state === "new")).length;

  const open = (c: Conversation) => {
    setSelectedId(c.id);
    setMobileView("thread");
    if (c.unread) ws.updateConversation(c.id, { unread: false });
  };

  return (
    <div className="ws-inbox" data-view={mobileView}>
      <nav className="ws-inbox__folders" aria-label="Inbox folders">
        <ul role="list">
          {FOLDERS.map((f) => (
            <li key={f.id}>
              <button type="button" className="ws-folder" aria-current={folder === f.id || undefined} onClick={() => setFolder(f.id)}>
                <f.icon aria-hidden size={15} />
                <span>{f.label}</span>
                {folderCount(f.id) > 0 && <span className="ws-count">{folderCount(f.id)}</span>}
              </button>
            </li>
          ))}
        </ul>
        <p className="ws-inbox__channels-note">Email, WhatsApp Business and website enquiries arrive here. Channels are simulated in this prototype.</p>
      </nav>

      <section className="ws-inbox__list" aria-label="Conversations">
        <div className="ws-inbox__tools">
          <h1 className="ws-inbox__heading">Inbox</h1>
          <div className="ws-chips ws-inbox__folderchips" role="group" aria-label="Folder">
            {FOLDERS.map((f) => (
              <button key={f.id} type="button" className="ws-chip" aria-pressed={folder === f.id} onClick={() => setFolder(f.id)}>
                {f.id === "all" ? "All" : f.id === "mine" ? "Mine" : f.id === "awaiting" ? "Awaiting" : f.label}
                {folderCount(f.id) > 0 && <span className="ws-count">{folderCount(f.id)}</span>}
              </button>
            ))}
          </div>
          <div className="ws-searchfield">
            <Search aria-hidden size={14} />
            <label htmlFor="inbox-search" className="ws-sr">
              Search conversations
            </label>
            <input id="inbox-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" />
          </div>
          <div className="ws-inbox__channels">
            <span id="channel-label">Channel</span>
            <div className="ws-chips" role="group" aria-labelledby="channel-label">
              {CHANNELS.map((c) => (
                <button key={c.id} type="button" className="ws-chip" aria-pressed={channel === c.id} onClick={() => setChannel(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {list.length ? (
          <ul role="list" className="ws-convlist">
            {list.map((c) => (
              <ConversationItem key={c.id} conversation={c} selected={c.id === selectedId} onOpen={() => open(c)} />
            ))}
          </ul>
        ) : (
          <EmptyState icon={InboxIcon} title={q ? "No matching conversations" : "Nothing here"}>
            {q ? "Try a name, a matter reference, or words from the message." : folder === "unassigned" ? "Every conversation has an owner." : "Conversations in this folder will appear here."}
          </EmptyState>
        )}
      </section>

      <section className="ws-inbox__thread" aria-label="Conversation">
        {selected ? (
          <ConversationPane
            key={selected.id}
            conversation={selected}
            contextOpen={contextOpen}
            onToggleContext={() => setContextOpen(!contextOpen)}
            onBack={() => setMobileView("list")}
          />
        ) : (
          <EmptyState icon={MessagesSquare} title="Select a conversation">
            Choose a conversation to read it with the client and matter alongside.
          </EmptyState>
        )}
      </section>

      {selected && (
        <ContextPanel open={contextOpen} onClose={() => setContextOpen(false)} label="Conversation context" drawerQuery={DRAWER_QUERY}>
          {selected.clientId || selected.matterId ? (
            <>
              {selected.clientId && <ClientBrief clientId={selected.clientId} />}
              {selected.matterId && <MatterBrief matterId={selected.matterId} heading="Linked matter" />}
            </>
          ) : (
            <ProspectBrief key={selected.id} conversation={selected} />
          )}
        </ContextPanel>
      )}
    </div>
  );
}

function ConversationItem({ conversation: c, selected, onOpen }: { conversation: Conversation; selected: boolean; onOpen: () => void }) {
  const ws = useWorkspace();
  const last = c.messages[c.messages.length - 1];
  const matter = c.matterId ? ws.lookup.matter.get(c.matterId) : undefined;
  const assignee = c.assigneeId ? ws.lookup.person.get(c.assigneeId) : undefined;
  return (
    <li>
      <button type="button" className="ws-conv" aria-current={selected || undefined} data-unread={c.unread || undefined} onClick={onOpen}>
        <span className="ws-conv__top">
          <ChannelMark channel={c.channel} />
          <span className="ws-conv__name">{c.contactName}</span>
          {c.unread && <span className="ws-sr">Unread.</span>}
          <time className="ws-conv__time">{formatShort(last.sentAt)}</time>
        </span>
        <span className="ws-conv__subject">{c.subject}</span>
        <span className="ws-conv__preview">{last.from === "firm" ? `You: ${last.body}` : last.body}</span>
        <span className="ws-conv__meta">
          {c.state === "new" && <Tag tone="accent">New enquiry</Tag>}
          {c.state === "awaiting" && <Tag tone="attention">Awaiting reply</Tag>}
          {matter && <span className="ws-ref">{matter.ref}</span>}
          <span className="ws-conv__assignee">
            {assignee ? (
              <>
                <Avatar person={assignee} /> <span className="ws-sr">Assigned to {assignee.name}</span>
              </>
            ) : (
              <span className="ws-muted">Unassigned</span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}

function ConversationPane({
  conversation: c,
  contextOpen,
  onToggleContext,
  onBack,
}: {
  conversation: Conversation;
  contextOpen: boolean;
  onToggleContext: () => void;
  onBack: () => void;
}) {
  const ws = useWorkspace();
  const [draft, setDraft] = useState<{ text: string; n: number } | null>(null);
  const [linking, setLinking] = useState(false);
  const matter = c.matterId ? ws.lookup.matter.get(c.matterId) : undefined;
  const assignee = c.assigneeId ? ws.lookup.person.get(c.assigneeId) : undefined;

  const assignItems: MenuItem[] = ws.team.map((p) => ({
    label: p.id === ws.me.id ? `${p.name} (me)` : p.name,
    onSelect: () => {
      ws.updateConversation(c.id, { assigneeId: p.id });
      ws.toast({ message: `Assigned to ${p.id === ws.me.id ? "you" : p.name}`, tone: "success" });
    },
  }));

  const moreItems: MenuItem[] = [
    { label: matter ? "Link to a different matter" : "Link to existing matter", icon: Link2, onSelect: () => setLinking(true) },
    c.state === "archived"
      ? { label: "Move back to inbox", icon: ArchiveRestore, onSelect: () => ws.updateConversation(c.id, { state: "open" }) }
      : {
          label: "Archive conversation",
          icon: Archive,
          onSelect: () => {
            ws.updateConversation(c.id, { state: "archived" });
            ws.toast({ message: "Conversation archived", action: { label: "Undo", onClick: () => ws.updateConversation(c.id, { state: c.state }) } });
          },
        },
  ];

  return (
    <div className="ws-pane">
      <header className="ws-pane__head">
        <button type="button" className="ws-iconbtn ws-pane__back" onClick={onBack} aria-label="Back to conversations">
          <ArrowLeft aria-hidden size={16} />
        </button>
        <div className="ws-pane__who">
          <h2>{c.subject}</h2>
          <p>
            <strong>{c.contactName}</strong> <ChannelMark channel={c.channel} withLabel /> <span className="ws-muted">{c.contactDetail}</span>
          </p>
        </div>
        <div className="ws-pane__actions">
          {matter ? (
            <Link href={`/workspace/matters/${matter.id}`} className="ws-btn ws-btn--sm" title={matter.title}>
              <Briefcase aria-hidden size={14} /> {matter.ref}
            </Link>
          ) : (
            <Tag tone="neutral" icon={Briefcase}>
              No matter
            </Tag>
          )}
          <ActionMenu
            label="Assign conversation"
            className="ws-btn ws-btn--sm"
            trigger={
              assignee ? (
                <>
                  <Avatar person={assignee} /> <span className="ws-hide-sm">{assignee.name.split(" ")[0]}</span>
                </>
              ) : (
                <>
                  <UserRound aria-hidden size={14} /> Assign
                </>
              )
            }
            items={assignItems}
          />
          <button
            type="button"
            className="ws-iconbtn"
            aria-pressed={contextOpen}
            onClick={onToggleContext}
            aria-label={contextOpen ? "Hide context panel" : "Show client and matter context"}
            title="Context"
          >
            <PanelRight aria-hidden size={16} />
          </button>
          <ActionMenu label="More conversation actions" items={moreItems} />
        </div>
      </header>

      {linking && (
        <form
          className="ws-linkbar"
          onSubmit={(e) => {
            e.preventDefault();
            const id = new FormData(e.currentTarget).get("matter") as string;
            const m = ws.lookup.matter.get(id);
            if (m) {
              ws.updateConversation(c.id, { matterId: m.id, clientId: m.clientId, state: c.state === "new" ? "open" : c.state });
              ws.toast({ message: `Linked to ${m.ref}`, tone: "success" });
            }
            setLinking(false);
          }}
        >
          <label htmlFor="link-matter">Link to matter</label>
          <select id="link-matter" name="matter" defaultValue={c.matterId ?? ""} required>
            <option value="" disabled>
              Choose…
            </option>
            {ws.matters.map((m) => (
              <option key={m.id} value={m.id}>
                {m.ref} — {ws.lookup.client.get(m.clientId)?.name}
              </option>
            ))}
          </select>
          <button type="submit" className="ws-btn ws-btn--sm ws-btn--primary">
            Link
          </button>
          <button type="button" className="ws-btn ws-btn--sm ws-btn--ghost" onClick={() => setLinking(false)}>
            Cancel
          </button>
        </form>
      )}

      <div className="ws-pane__scroll">
        <Thread conversation={c} />
      </div>

      <div className="ws-pane__compose">
        <Assist target="conversation" id={c.id} matterId={c.matterId} onDraft={(text) => setDraft({ text, n: (draft?.n ?? 0) + 1 })} />
        <Composer key={draft?.n ?? 0} conversation={c} draft={draft?.text} />
      </div>
    </div>
  );
}
