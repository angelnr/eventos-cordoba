-- Add aggregate columns to events
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- Add updatedAt to reviews and remove comment
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "reviews" DROP COLUMN IF EXISTS "comment";

-- Update existing reviews: set updatedAt = createdAt for existing rows
UPDATE "reviews" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Update foreign keys to add ON DELETE CASCADE
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_userId_fkey') THEN
    ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_fkey";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reviews_eventId_fkey') THEN
    ALTER TABLE "reviews" DROP CONSTRAINT "reviews_eventId_fkey";
  END IF;
END
$$;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "reviews_eventId_idx" ON "reviews"("eventId");
CREATE INDEX IF NOT EXISTS "reviews_userId_idx" ON "reviews"("userId");
CREATE INDEX IF NOT EXISTS "events_reviewCount_idx" ON "events"("reviewCount");

-- Backfill averageRating and reviewCount from existing reviews
UPDATE "events" e
SET 
  "averageRating" = COALESCE(r.avg_rating, 0),
  "reviewCount" = COALESCE(r.review_count, 0)
FROM (
  SELECT "eventId", ROUND(AVG("rating")::numeric, 2) as avg_rating, COUNT(*) as review_count
  FROM "reviews"
  GROUP BY "eventId"
) r
WHERE e.id = r."eventId";
