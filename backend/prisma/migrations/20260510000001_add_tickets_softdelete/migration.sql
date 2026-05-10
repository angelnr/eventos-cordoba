-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "token" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'valid',
    "bookingId" INTEGER NOT NULL,
    "scannedAt" TIMESTAMPTZ,
    "validatedById" INTEGER,
    "invalidatedAt" TIMESTAMPTZ,
    "invalidatedById" INTEGER,
    "invalidationReason" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_audit_logs" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "userId" INTEGER,
    "metadata" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_token_key" ON "tickets"("token");
CREATE UNIQUE INDEX "tickets_bookingId_key" ON "tickets"("bookingId");
CREATE INDEX "idx_tickets_token" ON "tickets"("token");
CREATE INDEX "idx_tickets_status" ON "tickets"("status");
CREATE INDEX "idx_tickets_bookingId" ON "tickets"("bookingId");
CREATE INDEX "idx_tickets_status_created" ON "tickets"("status", "createdAt");
CREATE INDEX "idx_audit_ticketId" ON "ticket_audit_logs"("ticketId");
CREATE INDEX "idx_audit_action" ON "ticket_audit_logs"("action");
CREATE INDEX "idx_audit_ticket_created" ON "ticket_audit_logs"("ticketId", "createdAt");
CREATE INDEX "idx_audit_created" ON "ticket_audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_invalidatedById_fkey" FOREIGN KEY ("invalidatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_audit_logs" ADD CONSTRAINT "ticket_audit_logs_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ticket_audit_logs" ADD CONSTRAINT "ticket_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable (soft delete for bookings)
ALTER TABLE "bookings" ADD COLUMN "cancelledAt" TIMESTAMPTZ;
