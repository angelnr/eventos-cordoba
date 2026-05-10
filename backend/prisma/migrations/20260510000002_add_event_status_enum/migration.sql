-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'CANCELLED', 'FINISHED', 'FULL');

-- Migrate existing data
UPDATE "events" SET "status" = 'SCHEDULED' WHERE "status" = 'active';
UPDATE "events" SET "status" = 'CANCELLED' WHERE "status" = 'cancelled';
UPDATE "events" SET "status" = 'FINISHED' WHERE "status" = 'completed';
UPDATE "events" SET "status" = 'SCHEDULED' WHERE "status" = 'draft';
UPDATE "events" SET "status" = 'SCHEDULED' WHERE "status" NOT IN ('SCHEDULED', 'CANCELLED', 'FINISHED');

-- AlterColumn (drop default first to avoid cast error, then re-add)
ALTER TABLE "events" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "events" ALTER COLUMN "status" TYPE "EventStatus" USING "status"::"EventStatus";
ALTER TABLE "events" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';

-- CreateTable
CREATE TABLE "event_status_logs" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "fromStatus" "EventStatus" NOT NULL,
    "toStatus" "EventStatus" NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "changedById" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_status_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_event_status_logs_eventId" ON "event_status_logs"("eventId");
CREATE INDEX "idx_event_status_logs_eventId_createdAt" ON "event_status_logs"("eventId", "createdAt");
CREATE INDEX "idx_event_status_logs_toStatus" ON "event_status_logs"("toStatus");

-- AddForeignKey
ALTER TABLE "event_status_logs" ADD CONSTRAINT "event_status_logs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_status_logs" ADD CONSTRAINT "event_status_logs_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
