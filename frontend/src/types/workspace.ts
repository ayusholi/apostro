/**
 * Workspace (practice management) domain shapes. These mirror what an API
 * would eventually return; the prototype fills them from src/data/workspace.
 * Statuses and stages are examples a firm would configure, not fixed rules.
 */

export type PersonId = string;

export type TeamMember = {
  id: PersonId;
  name: string;
  initials: string;
  role: string;
};

export type MatterType = "Property" | "Family" | "Civil dispute" | "Wills & estates";

export type MatterStatus = "Enquiry" | "Open" | "On hold" | "Awaiting client" | "Completed";

export type Client = {
  id: string;
  name: string;
  kind: "Individual" | "Joint" | "Organisation";
  /** Named contact for organisations / joint clients. */
  contact?: string;
  email: string;
  phone: string;
  preferredChannel: Channel;
  address: string;
  clientSince: string;
  idCheck: { status: "Verified" | "Outstanding"; date?: string };
  prospective?: boolean;
  notes?: string;
};

export type KeyDate = { label: string; date: string; source: string };

export type Matter = {
  id: string;
  ref: string;
  title: string;
  type: MatterType;
  clientId: string;
  responsibleId: PersonId;
  assistingIds: PersonId[];
  status: MatterStatus;
  opened: string;
  summary: string;
  /** Example stage track — configurable per firm and matter type. */
  stages: string[];
  stage: number;
  nextAction: string;
  keyDates: KeyDate[];
  otherSide?: { name: string; role: string };
  lastActivity: string;
};

export type Channel = "email" | "whatsapp" | "web";

export type Message = {
  id: string;
  from: "client" | "firm" | "note";
  authorName: string;
  sentAt: string;
  body: string;
  attachments?: string[];
};

export type ConversationState = "new" | "awaiting" | "open" | "archived";

export type Conversation = {
  id: string;
  subject: string;
  contactName: string;
  contactDetail: string;
  channel: Channel;
  clientId?: string;
  matterId?: string;
  assigneeId?: PersonId;
  state: ConversationState;
  unread: boolean;
  messages: Message[];
};

export type TaskStatus = "open" | "done";

export type Task = {
  id: string;
  title: string;
  matterId?: string;
  assigneeId: PersonId;
  due: string;
  status: TaskStatus;
  kind: "task" | "review" | "follow-up";
  documentId?: string;
  detail?: string;
};

export type WaitingItem = {
  id: string;
  title: string;
  matterId: string;
  waitingOn: string;
  since: string;
  lastChased?: string;
  expected?: string;
  status: "waiting" | "received";
};

export type Appointment = {
  id: string;
  title: string;
  start: string;
  end: string;
  matterId?: string;
  with?: string;
  location: string;
};

export type DocumentStatus = "Draft" | "Awaiting review" | "Final" | "From client" | "From other side";

export type LegalDocument = {
  id: string;
  name: string;
  matterId: string;
  kind: "pdf" | "docx" | "image";
  status: DocumentStatus;
  addedBy: string;
  addedAt: string;
  size: string;
  pages: number;
  preview: string[];
};

export type ActivityKind =
  | "message-in"
  | "message-out"
  | "note"
  | "document"
  | "task-done"
  | "status"
  | "event"
  | "call";

export type ActivityEvent = {
  id: string;
  matterId: string;
  kind: ActivityKind;
  at: string;
  actor: string;
  title: string;
  detail?: string;
};

export type Notification = {
  id: string;
  at: string;
  text: string;
  href: string;
  read: boolean;
};

export type AssistSuggestion = {
  summary?: string;
  draftReply?: string;
  missing?: string[];
  nextSteps?: string[];
  basedOn: string;
};
