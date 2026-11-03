"use client";

import { useId, useState } from "react";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { day, todayStamp } from "@/lib/workspace/dates";
import type { Channel } from "@/types/workspace";

/**
 * Compact creation forms used by the launcher and inline on matter / client
 * screens. Sensible defaults (today, me, current matter) mean most can be
 * submitted after typing a single line.
 */

type FormProps = { matterId?: string; title?: string; onDone: () => void; onCancel: () => void; autoFocus?: boolean };

function Field({ label, children, hint }: { label: string; children: (id: string) => React.ReactNode; hint?: string }) {
  const id = useId();
  return (
    <div className="ws-field">
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint && <p className="ws-field__hint">{hint}</p>}
    </div>
  );
}

function MatterSelect({ id, value, onChange, required }: { id: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  const ws = useWorkspace();
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      {!required && <option value="">No matter</option>}
      {required && !value && <option value="">Choose a matter…</option>}
      {ws.matters.map((m) => (
        <option key={m.id} value={m.id}>
          {m.ref} — {ws.lookup.client.get(m.clientId)?.name}
        </option>
      ))}
    </select>
  );
}

function FormActions({ submit, onCancel }: { submit: string; onCancel: () => void }) {
  return (
    <div className="ws-form__actions">
      <button type="button" className="ws-btn ws-btn--ghost" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" className="ws-btn ws-btn--primary">
        {submit}
      </button>
    </div>
  );
}

export function TaskForm({ matterId = "", title: initialTitle = "", onDone, onCancel, autoFocus = true }: FormProps) {
  const ws = useWorkspace();
  const [title, setTitle] = useState(initialTitle);
  const [due, setDue] = useState(day(1));
  const [assignee, setAssignee] = useState(ws.me.id);
  const [matter, setMatter] = useState(matterId);

  return (
    <form
      className="ws-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        ws.addTask({ title: title.trim(), due, assigneeId: assignee, matterId: matter || undefined });
        onDone();
      }}
    >
      <Field label="Task">
        {(id) => (
          <input id={id} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chase broker for mortgage offer" required autoFocus={autoFocus} />
        )}
      </Field>
      <div className="ws-form__row">
        <Field label="Due">{(id) => <input id={id} type="date" value={due} min={todayStamp()} onChange={(e) => setDue(e.target.value)} required />}</Field>
        <Field label="Assigned to">
          {(id) => (
            <select id={id} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              {ws.team.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id === ws.me.id ? `${p.name} (me)` : p.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <Field label="Related matter">{(id) => <MatterSelect id={id} value={matter} onChange={setMatter} />}</Field>
      <FormActions submit="Create task" onCancel={onCancel} />
    </form>
  );
}

export function NoteForm({ matterId = "", onDone, onCancel, autoFocus = true }: FormProps) {
  const ws = useWorkspace();
  const [matter, setMatter] = useState(matterId);
  const [kind, setKind] = useState<"note" | "call">("call");
  const [text, setText] = useState("");

  return (
    <form
      className="ws-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!matter || !text.trim()) return;
        ws.addNote(matter, text.trim(), kind);
        onDone();
      }}
    >
      <div className="ws-form__row">
        <Field label="Matter">{(id) => <MatterSelect id={id} value={matter} onChange={setMatter} required />}</Field>
        <Field label="Type">
          {(id) => (
            <select id={id} value={kind} onChange={(e) => setKind(e.target.value as "note" | "call")}>
              <option value="call">Attendance (telephone)</option>
              <option value="note">File note</option>
            </select>
          )}
        </Field>
      </div>
      <Field label="Note" hint="Saved to the matter timeline with your name and the current time.">
        {(id) => (
          <textarea id={id} rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Who you spoke to, what was discussed, what was agreed…" required autoFocus={autoFocus} />
        )}
      </Field>
      <FormActions submit="Save note" onCancel={onCancel} />
    </form>
  );
}

export function EnquiryForm({ onDone, onCancel }: FormProps) {
  const ws = useWorkspace();
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<Channel>("email");
  const [contact, setContact] = useState("");
  const [summary, setSummary] = useState("");

  return (
    <form
      className="ws-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !summary.trim()) return;
        ws.addEnquiry({ name: name.trim(), channel, contact: contact.trim(), summary: summary.trim() });
        onDone();
      }}
    >
      <div className="ws-form__row">
        <Field label="Name">{(id) => <input id={id} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required autoFocus />}</Field>
        <Field label="Came in by">
          {(id) => (
            <select id={id} value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
              <option value="email">Email / phone</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="web">Website form</option>
            </select>
          )}
        </Field>
      </div>
      <Field label="Email or phone">{(id) => <input id={id} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="How to reach them" />}</Field>
      <Field label="What do they need?" hint="Logged to the Inbox as a new enquiry. A conflict check is offered before any matter is opened.">
        {(id) => <textarea id={id} rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary in their words" required />}
      </Field>
      <FormActions submit="Log enquiry" onCancel={onCancel} />
    </form>
  );
}

export function AppointmentForm({ matterId = "", onDone, onCancel }: FormProps) {
  const ws = useWorkspace();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(day(1));
  const [time, setTime] = useState("10:00");
  const [matter, setMatter] = useState(matterId);

  return (
    <form
      className="ws-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const m = ws.lookup.matter.get(matter);
        ws.addAppointment({
          title: title.trim(),
          date,
          time,
          matterId: matter || undefined,
          with: m ? ws.lookup.client.get(m.clientId)?.name : undefined,
        });
        onDone();
      }}
    >
      <Field label="Appointment">{(id) => <input id={id} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Initial consultation" required autoFocus />}</Field>
      <div className="ws-form__row">
        <Field label="Date">{(id) => <input id={id} type="date" value={date} min={todayStamp()} onChange={(e) => setDate(e.target.value)} required />}</Field>
        <Field label="Time">{(id) => <input id={id} type="time" value={time} step={900} onChange={(e) => setTime(e.target.value)} required />}</Field>
      </div>
      <Field label="Related matter">{(id) => <MatterSelect id={id} value={matter} onChange={setMatter} />}</Field>
      <FormActions submit="Schedule" onCancel={onCancel} />
    </form>
  );
}
