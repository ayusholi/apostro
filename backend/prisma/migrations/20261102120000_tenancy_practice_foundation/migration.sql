-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "practice";

-- CreateEnum
CREATE TYPE "identity"."FirmStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "identity"."FirmRole" AS ENUM ('OWNER', 'ADMIN', 'FEE_EARNER', 'SUPPORT');

-- CreateEnum
CREATE TYPE "identity"."MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "practice"."ClientKind" AS ENUM ('INDIVIDUAL', 'ORGANISATION');

-- CreateEnum
CREATE TYPE "practice"."ClientStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "practice"."MatterStatus" AS ENUM ('OPEN', 'ON_HOLD', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "practice"."MatterClientRole" AS ENUM ('CLIENT', 'JOINT_CLIENT', 'OTHER');

-- CreateEnum
CREATE TYPE "practice"."TaskStatus" AS ENUM ('OPEN', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "practice"."Channel" AS ENUM ('EMAIL', 'WHATSAPP', 'WEB_FORM', 'PHONE', 'INTERNAL');

-- CreateEnum
CREATE TYPE "practice"."ConversationKind" AS ENUM ('ENQUIRY', 'CLIENT', 'OTHER');

-- CreateEnum
CREATE TYPE "practice"."ConversationStatus" AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "practice"."MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND', 'INTERNAL_NOTE');

-- CreateEnum
CREATE TYPE "practice"."DeliveryStatus" AS ENUM ('RECEIVED', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "practice"."ActivityType" AS ENUM ('MATTER_OPENED', 'MATTER_STATUS_CHANGED', 'TASK_CREATED', 'TASK_COMPLETED', 'MESSAGE_RECORDED', 'NOTE_ADDED', 'DOCUMENT_ADDED');

-- CreateEnum
CREATE TYPE "audit"."AuditOutcome" AS ENUM ('SUCCESS', 'FAILURE', 'DENIED');

-- CreateTable
CREATE TABLE "identity"."Firm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "identity"."FirmStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Firm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."FirmMembership" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "identity"."FirmRole" NOT NULL,
    "status" "identity"."MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirmMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice"."Client" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "kind" "practice"."ClientKind" NOT NULL,
    "status" "practice"."ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice"."Matter" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "matterType" TEXT NOT NULL,
    "status" "practice"."MatterStatus" NOT NULL DEFAULT 'OPEN',
    "stage" TEXT,
    "responsibleMembershipId" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Matter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice"."MatterClient" (
    "firmId" TEXT NOT NULL,
    "matterId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "role" "practice"."MatterClientRole" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatterClient_pkey" PRIMARY KEY ("firmId","matterId","clientId")
);

-- CreateTable
CREATE TABLE "practice"."Task" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "practice"."TaskStatus" NOT NULL DEFAULT 'OPEN',
    "dueAt" TIMESTAMP(3),
    "matterId" TEXT,
    "clientId" TEXT,
    "assigneeMembershipId" TEXT,
    "createdByMembershipId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice"."Conversation" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "channel" "practice"."Channel" NOT NULL,
    "kind" "practice"."ConversationKind" NOT NULL DEFAULT 'ENQUIRY',
    "status" "practice"."ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "subject" TEXT,
    "contactName" TEXT,
    "contactAddress" TEXT,
    "clientId" TEXT,
    "matterId" TEXT,
    "assigneeMembershipId" TEXT,
    "awaitingResponseSince" TIMESTAMP(3),
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice"."Message" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" "practice"."MessageDirection" NOT NULL,
    "senderLabel" TEXT,
    "bodyText" TEXT,
    "deliveryStatus" "practice"."DeliveryStatus" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice"."MessageProviderRef" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerMessageId" TEXT NOT NULL,
    "providerThreadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageProviderRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice"."ActivityEvent" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "type" "practice"."ActivityType" NOT NULL,
    "matterId" TEXT,
    "clientId" TEXT,
    "actorMembershipId" TEXT,
    "summary" TEXT NOT NULL,
    "subjectId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit"."AuditEvent" (
    "id" TEXT NOT NULL,
    "firmId" TEXT,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "outcome" "audit"."AuditOutcome" NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "requestId" TEXT,
    "ipAddress" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Firm_slug_key" ON "identity"."Firm"("slug");

-- CreateIndex
CREATE INDEX "FirmMembership_userId_status_idx" ON "identity"."FirmMembership"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FirmMembership_firmId_userId_key" ON "identity"."FirmMembership"("firmId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FirmMembership_firmId_id_key" ON "identity"."FirmMembership"("firmId", "id");

-- CreateIndex
CREATE INDEX "Client_firmId_status_displayName_idx" ON "practice"."Client"("firmId", "status", "displayName");

-- CreateIndex
CREATE INDEX "Client_firmId_email_idx" ON "practice"."Client"("firmId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_firmId_id_key" ON "practice"."Client"("firmId", "id");

-- CreateIndex
CREATE INDEX "Matter_firmId_status_idx" ON "practice"."Matter"("firmId", "status");

-- CreateIndex
CREATE INDEX "Matter_firmId_responsibleMembershipId_status_idx" ON "practice"."Matter"("firmId", "responsibleMembershipId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Matter_firmId_reference_key" ON "practice"."Matter"("firmId", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "Matter_firmId_id_key" ON "practice"."Matter"("firmId", "id");

-- CreateIndex
CREATE INDEX "MatterClient_firmId_clientId_idx" ON "practice"."MatterClient"("firmId", "clientId");

-- CreateIndex
CREATE INDEX "Task_firmId_assigneeMembershipId_status_dueAt_idx" ON "practice"."Task"("firmId", "assigneeMembershipId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "Task_firmId_matterId_status_idx" ON "practice"."Task"("firmId", "matterId", "status");

-- CreateIndex
CREATE INDEX "Task_firmId_clientId_idx" ON "practice"."Task"("firmId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Task_firmId_id_key" ON "practice"."Task"("firmId", "id");

-- CreateIndex
CREATE INDEX "Conversation_firmId_status_assigneeMembershipId_lastMessage_idx" ON "practice"."Conversation"("firmId", "status", "assigneeMembershipId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_firmId_status_awaitingResponseSince_idx" ON "practice"."Conversation"("firmId", "status", "awaitingResponseSince");

-- CreateIndex
CREATE INDEX "Conversation_firmId_matterId_idx" ON "practice"."Conversation"("firmId", "matterId");

-- CreateIndex
CREATE INDEX "Conversation_firmId_clientId_idx" ON "practice"."Conversation"("firmId", "clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_firmId_id_key" ON "practice"."Conversation"("firmId", "id");

-- CreateIndex
CREATE INDEX "Message_firmId_conversationId_occurredAt_idx" ON "practice"."Message"("firmId", "conversationId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Message_firmId_id_key" ON "practice"."Message"("firmId", "id");

-- CreateIndex
CREATE INDEX "MessageProviderRef_firmId_messageId_idx" ON "practice"."MessageProviderRef"("firmId", "messageId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageProviderRef_firmId_provider_providerMessageId_key" ON "practice"."MessageProviderRef"("firmId", "provider", "providerMessageId");

-- CreateIndex
CREATE INDEX "ActivityEvent_firmId_matterId_occurredAt_idx" ON "practice"."ActivityEvent"("firmId", "matterId", "occurredAt");

-- CreateIndex
CREATE INDEX "ActivityEvent_firmId_clientId_occurredAt_idx" ON "practice"."ActivityEvent"("firmId", "clientId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityEvent_firmId_id_key" ON "practice"."ActivityEvent"("firmId", "id");

-- CreateIndex
CREATE INDEX "AuditEvent_firmId_occurredAt_idx" ON "audit"."AuditEvent"("firmId", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorUserId_occurredAt_idx" ON "audit"."AuditEvent"("actorUserId", "occurredAt");

-- CreateIndex
CREATE INDEX "AuditEvent_resourceType_resourceId_idx" ON "audit"."AuditEvent"("resourceType", "resourceId");

-- AddForeignKey
ALTER TABLE "identity"."FirmMembership" ADD CONSTRAINT "FirmMembership_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "identity"."Firm"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "identity"."FirmMembership" ADD CONSTRAINT "FirmMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."User"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Client" ADD CONSTRAINT "Client_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "identity"."Firm"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Matter" ADD CONSTRAINT "Matter_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "identity"."Firm"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Matter" ADD CONSTRAINT "Matter_firmId_responsibleMembershipId_fkey" FOREIGN KEY ("firmId", "responsibleMembershipId") REFERENCES "identity"."FirmMembership"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."MatterClient" ADD CONSTRAINT "MatterClient_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "identity"."Firm"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."MatterClient" ADD CONSTRAINT "MatterClient_firmId_matterId_fkey" FOREIGN KEY ("firmId", "matterId") REFERENCES "practice"."Matter"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."MatterClient" ADD CONSTRAINT "MatterClient_firmId_clientId_fkey" FOREIGN KEY ("firmId", "clientId") REFERENCES "practice"."Client"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Task" ADD CONSTRAINT "Task_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "identity"."Firm"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Task" ADD CONSTRAINT "Task_firmId_matterId_fkey" FOREIGN KEY ("firmId", "matterId") REFERENCES "practice"."Matter"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Task" ADD CONSTRAINT "Task_firmId_clientId_fkey" FOREIGN KEY ("firmId", "clientId") REFERENCES "practice"."Client"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Task" ADD CONSTRAINT "Task_firmId_assigneeMembershipId_fkey" FOREIGN KEY ("firmId", "assigneeMembershipId") REFERENCES "identity"."FirmMembership"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Task" ADD CONSTRAINT "Task_firmId_createdByMembershipId_fkey" FOREIGN KEY ("firmId", "createdByMembershipId") REFERENCES "identity"."FirmMembership"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Conversation" ADD CONSTRAINT "Conversation_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "identity"."Firm"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Conversation" ADD CONSTRAINT "Conversation_firmId_clientId_fkey" FOREIGN KEY ("firmId", "clientId") REFERENCES "practice"."Client"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Conversation" ADD CONSTRAINT "Conversation_firmId_matterId_fkey" FOREIGN KEY ("firmId", "matterId") REFERENCES "practice"."Matter"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Conversation" ADD CONSTRAINT "Conversation_firmId_assigneeMembershipId_fkey" FOREIGN KEY ("firmId", "assigneeMembershipId") REFERENCES "identity"."FirmMembership"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Message" ADD CONSTRAINT "Message_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "identity"."Firm"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."Message" ADD CONSTRAINT "Message_firmId_conversationId_fkey" FOREIGN KEY ("firmId", "conversationId") REFERENCES "practice"."Conversation"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."MessageProviderRef" ADD CONSTRAINT "MessageProviderRef_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "identity"."Firm"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."MessageProviderRef" ADD CONSTRAINT "MessageProviderRef_firmId_messageId_fkey" FOREIGN KEY ("firmId", "messageId") REFERENCES "practice"."Message"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."ActivityEvent" ADD CONSTRAINT "ActivityEvent_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "identity"."Firm"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."ActivityEvent" ADD CONSTRAINT "ActivityEvent_firmId_matterId_fkey" FOREIGN KEY ("firmId", "matterId") REFERENCES "practice"."Matter"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."ActivityEvent" ADD CONSTRAINT "ActivityEvent_firmId_clientId_fkey" FOREIGN KEY ("firmId", "clientId") REFERENCES "practice"."Client"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "practice"."ActivityEvent" ADD CONSTRAINT "ActivityEvent_firmId_actorMembershipId_fkey" FOREIGN KEY ("firmId", "actorMembershipId") REFERENCES "identity"."FirmMembership"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;


-- ════════════════════════════════════════════════════════════════════════
-- Hand-written constraints. Prisma doesn't model CHECK constraints or
-- triggers, and its migration diffing leaves them in place. Keep this
-- section in sync with docs/architecture/DOMAIN_MODEL.md.
-- ════════════════════════════════════════════════════════════════════════

-- Firm slugs are lowercase, URL-safe handles.
ALTER TABLE "identity"."Firm"
  ADD CONSTRAINT "Firm_slug_format_check"
  CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- A task has a completion time exactly when it is done.
ALTER TABLE "practice"."Task"
  ADD CONSTRAINT "Task_completedAt_matches_status_check"
  CHECK (("status" = 'DONE') = ("completedAt" IS NOT NULL));

-- A closed or archived matter records when it closed; an open one doesn't.
ALTER TABLE "practice"."Matter"
  ADD CONSTRAINT "Matter_closedAt_matches_status_check"
  CHECK (("status" IN ('CLOSED', 'ARCHIVED')) = ("closedAt" IS NOT NULL));

-- Required text is not blank.
ALTER TABLE "practice"."Matter"
  ADD CONSTRAINT "Matter_reference_not_blank_check" CHECK (btrim("reference") <> '');
ALTER TABLE "practice"."Task"
  ADD CONSTRAINT "Task_title_not_blank_check" CHECK (btrim("title") <> '');
ALTER TABLE "practice"."Client"
  ADD CONSTRAINT "Client_displayName_not_blank_check" CHECK (btrim("displayName") <> '');

-- Audit events are append-only. This holds for every role that doesn't
-- disable triggers (a superuser or table owner can; see
-- docs/architecture/SECURITY_AND_TENANCY.md for the role separation that
-- must accompany it before production).
CREATE FUNCTION "audit"."reject_audit_mutation"() RETURNS trigger
  LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit.AuditEvent is append-only (% rejected)', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

CREATE TRIGGER "AuditEvent_append_only"
  BEFORE UPDATE OR DELETE ON "audit"."AuditEvent"
  FOR EACH ROW EXECUTE FUNCTION "audit"."reject_audit_mutation"();

CREATE TRIGGER "AuditEvent_no_truncate"
  BEFORE TRUNCATE ON "audit"."AuditEvent"
  FOR EACH STATEMENT EXECUTE FUNCTION "audit"."reject_audit_mutation"();
