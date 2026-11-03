-- CreateTable
CREATE TABLE "identity"."FirmInvitation" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "identity"."FirmRole" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedByMembershipId" TEXT NOT NULL,
    "acceptedMembershipId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FirmInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FirmInvitation_tokenHash_key" ON "identity"."FirmInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "FirmInvitation_firmId_email_idx" ON "identity"."FirmInvitation"("firmId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "FirmInvitation_firmId_id_key" ON "identity"."FirmInvitation"("firmId", "id");

-- AddForeignKey
ALTER TABLE "identity"."FirmInvitation" ADD CONSTRAINT "FirmInvitation_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "identity"."Firm"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "identity"."FirmInvitation" ADD CONSTRAINT "FirmInvitation_firmId_invitedByMembershipId_fkey" FOREIGN KEY ("firmId", "invitedByMembershipId") REFERENCES "identity"."FirmMembership"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "identity"."FirmInvitation" ADD CONSTRAINT "FirmInvitation_firmId_acceptedMembershipId_fkey" FOREIGN KEY ("firmId", "acceptedMembershipId") REFERENCES "identity"."FirmMembership"("firmId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;


-- ════════════════════════════════════════════════════════════════════════
-- Hand-written constraints. Prisma doesn't model these; keep them in sync
-- with docs/architecture/DOMAIN_MODEL.md.
-- ════════════════════════════════════════════════════════════════════════

-- Emails are compared exactly against User.email, which is stored lowercase.
ALTER TABLE "identity"."FirmInvitation"
  ADD CONSTRAINT "FirmInvitation_email_lowercase_check"
  CHECK ("email" = lower("email") AND btrim("email") <> '');

-- An invitation ends one way: accepted (with the membership it produced) or revoked.
ALTER TABLE "identity"."FirmInvitation"
  ADD CONSTRAINT "FirmInvitation_single_outcome_check"
  CHECK (NOT ("acceptedAt" IS NOT NULL AND "revokedAt" IS NOT NULL));
ALTER TABLE "identity"."FirmInvitation"
  ADD CONSTRAINT "FirmInvitation_accepted_membership_check"
  CHECK (("acceptedAt" IS NOT NULL) = ("acceptedMembershipId" IS NOT NULL));

-- At most one pending invitation per email per firm. Re-inviting revokes
-- the previous one in the same transaction.
CREATE UNIQUE INDEX "FirmInvitation_one_pending_per_email"
  ON "identity"."FirmInvitation" ("firmId", "email")
  WHERE "acceptedAt" IS NULL AND "revokedAt" IS NULL;
