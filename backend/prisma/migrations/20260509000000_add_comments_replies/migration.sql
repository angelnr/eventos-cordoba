-- AlterTable: add parentId, status, updatedAt to comments
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "parentId" INTEGER;
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey for self-referencing parentId
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comments_parentId_fkey'
  ) THEN
    ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "comments_eventId_status_createdAt_idx" ON "comments"("eventId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "comments_userId_idx" ON "comments"("userId");
CREATE INDEX IF NOT EXISTS "comments_parentId_idx" ON "comments"("parentId");

-- Update existing records
UPDATE "comments" SET "status" = 'approved', "updatedAt" = CURRENT_TIMESTAMP WHERE "status" IS NULL;
