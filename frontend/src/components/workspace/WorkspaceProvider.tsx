"use client";

import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState } from "react";
import type {
  ActivityEvent,
  Appointment,
  Channel,
  Client,
  Conversation,
  LegalDocument,
  Matter,
  MatterStatus,
  MatterType,
  Notification,
  Task,
  TeamMember,
  WaitingItem,
} from "@/types/workspace";
import { CURRENT_USER_ID, clients, notifications, team } from "@/data/workspace/people";
import { matters } from "@/data/workspace/matters";
import { conversations } from "@/data/workspace/conversations";
import { appointments, tasks, waiting } from "@/data/workspace/work";
import { documents } from "@/data/workspace/documents";
import { activity } from "@/data/workspace/activity";
import { day, nowStamp, todayStamp } from "@/lib/workspace/dates";

/**
 * Single client-side store for the prototype. Everything is seeded from
 * src/data/workspace and lives only in memory. A reload resets it. The action
 * names map one-to-one to the API calls a real backend would expose.
 */

export type DeskItem = { kind: "matter" | "client"; id: string };

type State = {
  clients: Client[];
  matters: Matter[];
  conversations: Conversation[];
  tasks: Task[];
  waiting: WaitingItem[];
  appointments: Appointment[];
  documents: LegalDocument[];
  activity: ActivityEvent[];
  notifications: Notification[];
  desk: DeskItem[];
};

type Action =
  | { type: "task/status"; id: string; status: Task["status"] }
  | { type: "task/add"; task: Task }
  | { type: "waiting/received"; id: string }
  | { type: "activity/add"; event: ActivityEvent }
  | { type: "conversation/send"; id: string; body: string; message: string }
  | { type: "conversation/update"; id: string; patch: Partial<Conversation> }
  | { type: "conversation/add"; conversation: Conversation }
  | { type: "intake"; conversationId: string; client: Client; matter: Matter }
  | { type: "appointment/add"; appointment: Appointment }
  | { type: "matter/status"; id: string; status: MatterStatus }
  | { type: "notifications/read" }
  | { type: "desk/touch"; item: DeskItem }
  | { type: "desk/remove"; item: DeskItem };

const initialState: State = {
  clients,
  matters,
  conversations,
  tasks,
  waiting,
  appointments,
  documents,
  activity,
  notifications,
  desk: [
    { kind: "matter", id: "pro-0142" },
    { kind: "matter", id: "civ-0219" },
  ],
};

let seq = 0;
export function uid(prefix: string) {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}${seq}`;
}

const sameDesk = (a: DeskItem, b: DeskItem) => a.kind === b.kind && a.id === b.id;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "task/status":
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, status: action.status } : t)) };
    case "task/add":
      return { ...state, tasks: [action.task, ...state.tasks] };
    case "waiting/received":
      return {
        ...state,
        waiting: state.waiting.map((w) => (w.id === action.id ? { ...w, status: "received" } : w)),
      };
    case "activity/add":
      return {
        ...state,
        activity: [...state.activity, action.event],
        matters: state.matters.map((m) =>
          m.id === action.event.matterId ? { ...m, lastActivity: action.event.at } : m,
        ),
      };
    case "conversation/send":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id
            ? {
                ...c,
                state: "open",
                unread: false,
                messages: [
                  ...c.messages,
                  { id: action.message, from: "firm", authorName: "Saul Goodman", sentAt: nowStamp(), body: action.body },
                ],
              }
            : c,
        ),
      };
    case "conversation/update":
      return {
        ...state,
        conversations: state.conversations.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)),
      };
    case "conversation/add":
      return { ...state, conversations: [action.conversation, ...state.conversations] };
    case "intake":
      return {
        ...state,
        clients: [...state.clients, action.client],
        matters: [action.matter, ...state.matters],
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, clientId: action.client.id, matterId: action.matter.id, assigneeId: action.matter.responsibleId, state: "open" }
            : c,
        ),
        desk: [{ kind: "matter" as const, id: action.matter.id }, ...state.desk].slice(0, 5),
      };
    case "appointment/add":
      return { ...state, appointments: [...state.appointments, action.appointment] };
    case "matter/status":
      return { ...state, matters: state.matters.map((m) => (m.id === action.id ? { ...m, status: action.status } : m)) };
    case "notifications/read":
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case "desk/touch":
      if (state.desk[0] && sameDesk(state.desk[0], action.item)) return state;
      return { ...state, desk: [action.item, ...state.desk.filter((d) => !sameDesk(d, action.item))].slice(0, 5) };
    case "desk/remove":
      return { ...state, desk: state.desk.filter((d) => !sameDesk(d, action.item)) };
  }
}

export type Toast = {
  id: string;
  message: string;
  tone?: "success" | "neutral";
  action?: { label: string; onClick: () => void };
};

export type NewTaskInput = { title: string; due: string; assigneeId: string; matterId?: string };
export type IntakeInput = {
  conversationId: string;
  name: string;
  email: string;
  phone: string;
  matterTitle: string;
  matterType: MatterType;
  responsibleId: string;
};

const PREFIX: Record<MatterType, string> = {
  Property: "PRO",
  Family: "FAM",
  "Civil dispute": "CIV",
  "Wills & estates": "WIL",
};

function useWorkspaceValue() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const refSeq = useRef(400);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = uid("toast");
    setToasts((all) => [...all.slice(-2), { ...t, id }]);
    window.setTimeout(() => setToasts((all) => all.filter((x) => x.id !== id)), 6000);
  }, []);
  const dismissToast = useCallback((id: string) => setToasts((all) => all.filter((x) => x.id !== id)), []);

  const lookup = useMemo(() => {
    const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));
    return {
      matter: byId(state.matters),
      client: byId(state.clients),
      conversation: byId(state.conversations),
      document: byId(state.documents),
      person: byId<TeamMember>(team),
    };
  }, [state.matters, state.clients, state.conversations, state.documents]);

  const logActivity = useCallback(
    (matterId: string, kind: ActivityEvent["kind"], title: string, detail?: string) =>
      dispatch({
        type: "activity/add",
        event: { id: uid("e"), matterId, kind, at: nowStamp(), actor: "Saul Goodman", title, detail },
      }),
    [],
  );

  const setTaskStatus = useCallback(
    (id: string, status: Task["status"], { silent = false } = {}) => {
      const task = state.tasks.find((t) => t.id === id);
      dispatch({ type: "task/status", id, status });
      if (task?.matterId && status === "done") logActivity(task.matterId, "task-done", `Task completed: ${task.title}`);
      if (!silent && status === "done") {
        toast({
          message: `Completed “${task?.title ?? "task"}”`,
          tone: "success",
          action: { label: "Undo", onClick: () => dispatch({ type: "task/status", id, status: "open" }) },
        });
      }
    },
    [state.tasks, logActivity, toast],
  );

  const addTask = useCallback(
    (input: NewTaskInput) => {
      dispatch({ type: "task/add", task: { id: uid("t"), kind: "task", status: "open", ...input } });
      toast({ message: `Task created: ${input.title}`, tone: "success" });
    },
    [toast],
  );

  const addNote = useCallback(
    (matterId: string, text: string, kind: "note" | "call" = "note") => {
      const title = kind === "call" ? "Attendance note (telephone)" : "File note added";
      logActivity(matterId, kind, title, text);
      toast({ message: "Note added to the matter timeline", tone: "success" });
    },
    [logActivity, toast],
  );

  const sendMessage = useCallback(
    (conversationId: string, body: string) => {
      const convo = state.conversations.find((c) => c.id === conversationId);
      dispatch({ type: "conversation/send", id: conversationId, body, message: uid("m") });
      if (convo?.matterId) logActivity(convo.matterId, "message-out", `Replied to ${convo.contactName}`);
      toast({
        message: `Reply recorded for ${convo?.contactName ?? "contact"} — prototype only, nothing was sent`,
        tone: "success",
      });
    },
    [state.conversations, logActivity, toast],
  );

  const updateConversation = useCallback(
    (id: string, patch: Partial<Conversation>) => dispatch({ type: "conversation/update", id, patch }),
    [],
  );

  const addEnquiry = useCallback(
    (input: { name: string; channel: Channel; contact: string; summary: string }) => {
      const id = uid("c");
      dispatch({
        type: "conversation/add",
        conversation: {
          id,
          subject: "New enquiry",
          contactName: input.name,
          contactDetail: input.contact,
          channel: input.channel,
          state: "new",
          unread: false,
          assigneeId: CURRENT_USER_ID,
          messages: [
            { id: uid("m"), from: "note", authorName: "Saul Goodman", sentAt: nowStamp(), body: input.summary },
          ],
        },
      });
      toast({ message: `Enquiry logged for ${input.name}`, tone: "success" });
      return id;
    },
    [toast],
  );

  const intake = useCallback(
    (input: IntakeInput) => {
      refSeq.current += 1;
      const prefix = PREFIX[input.matterType];
      const number = String(refSeq.current).padStart(4, "0");
      const clientId = uid("cl");
      const matterId = `${prefix.toLowerCase()}-${number}`;
      const convo = state.conversations.find((c) => c.id === input.conversationId);
      const client: Client = {
        id: clientId,
        name: input.name,
        kind: "Individual",
        email: input.email,
        phone: input.phone,
        preferredChannel: convo?.channel ?? "email",
        address: "Not yet recorded",
        clientSince: todayStamp(),
        idCheck: { status: "Outstanding" },
      };
      const matter: Matter = {
        id: matterId,
        ref: `${prefix}/${number}`,
        title: input.matterTitle,
        type: input.matterType,
        clientId,
        responsibleId: input.responsibleId,
        assistingIds: [],
        status: "Enquiry",
        opened: todayStamp(),
        summary: convo?.messages[0]?.body.split("\n")[0] ?? "",
        stages: ["Enquiry", "Instructed", "In progress", "Concluded"],
        stage: 0,
        nextAction: "Confirm instructions and send client care letter",
        keyDates: [],
        lastActivity: nowStamp(),
      };
      dispatch({ type: "intake", conversationId: input.conversationId, client, matter });
      for (const title of ["Verify client ID", "Send client care letter and terms"]) {
        dispatch({
          type: "task/add",
          task: { id: uid("t"), title, kind: "task", status: "open", matterId, assigneeId: input.responsibleId, due: day(1) },
        });
      }
      dispatch({
        type: "activity/add",
        event: {
          id: uid("e"),
          matterId,
          kind: "status",
          at: nowStamp(),
          actor: "Saul Goodman",
          title: "Matter opened from enquiry",
          detail: `Linked ${convo?.channel === "web" ? "website enquiry" : "conversation"} from ${input.name}.`,
        },
      });
      return matter;
    },
    [state.conversations],
  );

  const addAppointment = useCallback(
    (input: { title: string; date: string; time: string; matterId?: string; with?: string }) => {
      const [h, m] = input.time.split(":").map(Number);
      const endMinutes = h * 60 + m + 30;
      const end = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
      dispatch({
        type: "appointment/add",
        appointment: {
          id: uid("a"),
          title: input.title,
          start: `${input.date}T${input.time}`,
          end: `${input.date}T${end}`,
          matterId: input.matterId,
          with: input.with,
          location: "To be confirmed",
        },
      });
      toast({ message: `Appointment scheduled: ${input.title}`, tone: "success" });
    },
    [toast],
  );

  const markReceived = useCallback(
    (id: string) => {
      const item = state.waiting.find((w) => w.id === id);
      dispatch({ type: "waiting/received", id });
      if (item) logActivity(item.matterId, "document", `Received: ${item.title}`, `From ${item.waitingOn}`);
      toast({ message: `Marked “${item?.title}” as received`, tone: "success" });
    },
    [state.waiting, logActivity, toast],
  );

  const chase = useCallback(
    (id: string) => {
      const item = state.waiting.find((w) => w.id === id);
      if (item) logActivity(item.matterId, "message-out", `Chased ${item.waitingOn}`, item.title);
      toast({ message: `Chaser logged for “${item?.title}”` });
    },
    [state.waiting, logActivity, toast],
  );

  const setMatterStatus = useCallback(
    (id: string, status: MatterStatus) => {
      dispatch({ type: "matter/status", id, status });
      logActivity(id, "status", `Status changed to ${status}`);
      toast({ message: `Matter status updated to ${status}`, tone: "success" });
    },
    [logActivity, toast],
  );

  const touchDesk = useCallback((item: DeskItem) => dispatch({ type: "desk/touch", item }), []);
  const removeDesk = useCallback((item: DeskItem) => dispatch({ type: "desk/remove", item }), []);
  const readNotifications = useCallback(() => dispatch({ type: "notifications/read" }), []);

  return {
    ...state,
    me: lookup.person.get(CURRENT_USER_ID)!,
    team,
    lookup,
    toasts,
    toast,
    dismissToast,
    setTaskStatus,
    addTask,
    addNote,
    sendMessage,
    updateConversation,
    addEnquiry,
    intake,
    addAppointment,
    markReceived,
    chase,
    setMatterStatus,
    touchDesk,
    removeDesk,
    readNotifications,
  };
}

export type Workspace = ReturnType<typeof useWorkspaceValue>;

const WorkspaceContext = createContext<Workspace | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const value = useWorkspaceValue();
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
}

