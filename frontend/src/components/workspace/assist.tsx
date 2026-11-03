"use client";

import { useState } from "react";
import { Copy, ListChecks, NotebookPen, PenLine, Plus, SearchCheck, Sparkles, X } from "lucide-react";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { useShell } from "@/components/workspace/shell/ShellContext";
import { conversationAssist, matterAssist } from "@/data/workspace/assist";

/**
 * Assist: contextual help placed beside the work. Output here is canned
 * prototype text (see src/data/workspace/assist.ts) — no AI service is
 * connected. Everything it produces is labelled as suggested, is editable,
 * and needs a person to act on it. Nothing is sent or changed automatically.
 */

type Mode = "summary" | "missing" | "nextSteps";

export function Assist({
  target,
  id,
  matterId,
  onDraft,
  compact = false,
}: {
  target: "conversation" | "matter";
  id: string;
  /** Matter to file accepted notes and tasks against. */
  matterId?: string;
  /** When provided, "Draft reply" hands the suggestion to the composer. */
  onDraft?: (text: string) => void;
  compact?: boolean;
}) {
  const source = target === "conversation" ? conversationAssist[id] : matterAssist[id];
  const [mode, setMode] = useState<Mode | null>(null);

  if (!source) return null;

  const buttons: { mode: Mode | "draft"; label: string; icon: typeof Sparkles; show: boolean }[] = [
    { mode: "summary", label: target === "matter" ? "Summarise recent activity" : "Summarise", icon: Sparkles, show: !!source.summary },
    { mode: "draft", label: "Draft reply", icon: PenLine, show: !!source.draftReply && !!onDraft },
    { mode: "missing", label: "Check for gaps", icon: SearchCheck, show: !!source.missing?.length },
    { mode: "nextSteps", label: "Suggest next steps", icon: ListChecks, show: !!source.nextSteps?.length },
  ];

  return (
    <div className={`ws-assist${compact ? " ws-assist--compact" : ""}`}>
      <div className="ws-assist__bar" role="group" aria-label="Assist">
        <span className="ws-assist__label">
          <Sparkles aria-hidden size={13} />
          Assist
        </span>
        {buttons
          .filter((b) => b.show)
          .map((b) => (
            <button
              key={b.mode}
              type="button"
              className="ws-assist__btn"
              aria-pressed={mode === b.mode}
              onClick={() => {
                if (b.mode === "draft") {
                  onDraft?.(source.draftReply!);
                  setMode(null);
                } else setMode(mode === b.mode ? null : b.mode);
              }}
            >
              <b.icon aria-hidden size={13} />
              {b.label}
            </button>
          ))}
      </div>
      {mode && <Suggestion key={mode} mode={mode} source={source} matterId={matterId} onClose={() => setMode(null)} />}
    </div>
  );
}

function Suggestion({
  mode,
  source,
  matterId,
  onClose,
}: {
  mode: Mode;
  source: (typeof matterAssist)[string];
  matterId?: string;
  onClose: () => void;
}) {
  const ws = useWorkspace();
  const { openLauncher } = useShell();
  const [text, setText] = useState(source.summary ?? "");
  const title = mode === "summary" ? "Suggested summary" : mode === "missing" ? "Possible gaps" : "Suggested next steps";

  return (
    <section className="ws-suggestion" aria-label={title}>
      <header className="ws-suggestion__head">
        <span className="ws-suggestion__badge">
          <Sparkles aria-hidden size={12} /> Suggested
        </span>
        <h4>{title}</h4>
        <button type="button" className="ws-iconbtn ws-iconbtn--sm" onClick={onClose} aria-label="Discard suggestion" title="Discard">
          <X aria-hidden size={14} />
        </button>
      </header>
      <p className="ws-suggestion__basis">
        Based on {source.basedOn}. Simulated prototype output; check against the file before relying on it.
      </p>

      {mode === "summary" && (
        <>
          <label className="ws-sr" htmlFor="ws-suggestion-text">
            Editable summary
          </label>
          <textarea id="ws-suggestion-text" className="ws-suggestion__text" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="ws-suggestion__actions">
            {matterId && (
              <button
                type="button"
                className="ws-btn ws-btn--sm"
                onClick={() => {
                  ws.addNote(matterId, text);
                  onClose();
                }}
              >
                <NotebookPen aria-hidden size={14} /> Save as file note
              </button>
            )}
            <button
              type="button"
              className="ws-btn ws-btn--sm ws-btn--ghost"
              onClick={() => {
                navigator.clipboard?.writeText(text).catch(() => {});
                ws.toast({ message: "Summary copied" });
              }}
            >
              <Copy aria-hidden size={14} /> Copy
            </button>
          </div>
        </>
      )}

      {mode === "missing" && (
        <ul className="ws-suggestion__list" role="list">
          {source.missing?.map((item) => (
            <li key={item}>
              <span>{item}</span>
              {matterId && (
                <button type="button" className="ws-linkbtn" onClick={() => openLauncher({ action: "task", matterId, title: `Follow up: ${item}` })}>
                  <Plus aria-hidden size={13} /> Task
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {mode === "nextSteps" && (
        <ul className="ws-suggestion__list" role="list">
          {source.nextSteps?.map((item) => (
            <li key={item}>
              <span>{item}</span>
              {matterId && (
                <button type="button" className="ws-linkbtn" onClick={() => openLauncher({ action: "task", matterId, title: item })}>
                  <Plus aria-hidden size={13} /> Create task
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
