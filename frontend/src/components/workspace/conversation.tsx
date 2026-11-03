"use client";

import { useState } from "react";
import { Paperclip, Send, Sparkles, StickyNote } from "lucide-react";
import type { Conversation } from "@/types/workspace";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { Avatar, ChannelMark, channelLabel } from "@/components/workspace/ui";
import { formatStamp, nowStamp } from "@/lib/workspace/dates";

export function Thread({ conversation, limit }: { conversation: Conversation; limit?: number }) {
  const messages = limit ? conversation.messages.slice(-limit) : conversation.messages;
  const hidden = conversation.messages.length - messages.length;
  return (
    <ol className="ws-thread" aria-label={`Messages with ${conversation.contactName}`}>
      {hidden > 0 && <li className="ws-thread__more">{hidden} earlier message{hidden > 1 ? "s" : ""}</li>}
      {messages.map((m) => (
        <li key={m.id} className={`ws-message ws-message--${m.from}`}>
          <div className="ws-message__head">
            <Avatar name={m.authorName} />
            <strong>{m.authorName}</strong>
            {m.from === "note" && <span className="ws-message__kind">Internal note</span>}
            <time>{formatStamp(m.sentAt)}</time>
          </div>
          <div className="ws-message__body">{m.body}</div>
          {m.attachments && (
            <ul className="ws-message__files" role="list">
              {m.attachments.map((a) => (
                <li key={a}>
                  <Paperclip aria-hidden size={13} />
                  {a}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * Reply composer. A suggested draft from Assist arrives pre-filled but marked
 * as such, and Send stays disabled until the user confirms they've reviewed it.
 * "Send" records the reply locally — no message leaves the prototype.
 */
export function Composer({
  conversation,
  draft,
  compact = false,
  onSent,
}: {
  conversation: Conversation;
  draft?: string;
  compact?: boolean;
  onSent?: () => void;
}) {
  const ws = useWorkspace();
  const [text, setText] = useState(draft ?? "");
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [reviewed, setReviewed] = useState(!draft);
  const fromAssist = Boolean(draft);
  const id = `composer-${conversation.id}`;

  const submit = () => {
    if (!text.trim()) return;
    if (mode === "note") {
      ws.updateConversation(conversation.id, {
        messages: [
          ...conversation.messages,
          { id: `${conversation.id}-n${conversation.messages.length}`, from: "note", authorName: ws.me.name, sentAt: nowStamp(), body: text.trim() },
        ],
      });
      ws.toast({ message: "Internal note added — not visible to the contact", tone: "success" });
    } else {
      ws.sendMessage(conversation.id, text.trim());
    }
    setText("");
    onSent?.();
  };

  return (
    <form
      className={`ws-composer${compact ? " ws-composer--compact" : ""}${mode === "note" ? " ws-composer--note" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="ws-composer__tabs" role="group" aria-label="Composer mode">
        <button type="button" aria-pressed={mode === "reply"} onClick={() => setMode("reply")}>
          Reply
        </button>
        <button type="button" aria-pressed={mode === "note"} onClick={() => setMode("note")}>
          <StickyNote aria-hidden size={13} /> Internal note
        </button>
        <span className="ws-composer__via">
          {mode === "reply" ? (
            <>
              via <ChannelMark channel={conversation.channel} withLabel />
            </>
          ) : (
            "Only visible to the firm"
          )}
        </span>
      </div>
      {fromAssist && mode === "reply" && (
        <p className="ws-composer__draftnote">
          <Sparkles aria-hidden size={13} />
          Suggested draft from Assist. Edit it, check any [placeholders], and confirm before sending.
        </p>
      )}
      <label htmlFor={id} className="ws-sr">
        {mode === "reply" ? `Reply to ${conversation.contactName} by ${channelLabel(conversation.channel)}` : "Internal note"}
      </label>
      <textarea
        id={id}
        className={fromAssist && mode === "reply" ? "ws-composer__input ws-composer__input--suggested" : "ws-composer__input"}
        rows={compact ? 4 : 5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={mode === "reply" ? `Write to ${conversation.contactName.split(" ")[0]}…` : "Add a note for colleagues…"}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            if (mode === "note" || reviewed) submit();
          }
        }}
      />
      <div className="ws-composer__foot">
        {fromAssist && mode === "reply" ? (
          <label className="ws-check">
            <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />
            I’ve reviewed this draft
          </label>
        ) : (
          <span className="ws-composer__hint">Ctrl/⌘ + Enter to send</span>
        )}
        <button type="submit" className="ws-btn ws-btn--primary" disabled={!text.trim() || (mode === "reply" && !reviewed)}>
          <Send aria-hidden size={14} />
          {mode === "reply" ? "Send" : "Add note"}
        </button>
      </div>
    </form>
  );
}
