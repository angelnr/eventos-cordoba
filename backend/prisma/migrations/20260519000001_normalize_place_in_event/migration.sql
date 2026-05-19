-- CreateTable: places
CREATE TABLE "places" (
    "id" SERIAL NOT NULL,
    "externalPlaceId" TEXT,
    "formattedAddress" TEXT,
    "city" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "locationMetadata" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: places_externalPlaceId_key
CREATE UNIQUE INDEX "places_externalPlaceId_key" ON "places"("externalPlaceId");

-- CreateIndex: places_city_idx
CREATE INDEX "places_city_idx" ON "places"("city");

-- CreateIndex: places_latitude_longitude_idx
CREATE INDEX "places_latitude_longitude_idx" ON "places"("latitude", "longitude");

-- Migrate data: create Place rows from distinct placeId data in events
INSERT INTO "places" ("externalPlaceId", "formattedAddress", "city", "country", "postalCode", "locationMetadata", "latitude", "longitude")
SELECT DISTINCT
    "placeId",
    "formattedAddress",
    "city",
    "country",
    "postalCode",
    "locationMetadata",
    "latitude",
    "longitude"
FROM "events"
WHERE "placeId" IS NOT NULL;

-- AlterTable: add locationId column to events
ALTER TABLE "events" ADD COLUMN "locationId" INTEGER;

-- Populate locationId in events from the new places table
UPDATE "events"
SET "locationId" = "places"."id"
FROM "places"
WHERE "events"."placeId" = "places"."externalPlaceId";

-- DropForeignKey: event old FK constraints are not affected; only need to add new one
ALTER TABLE "events" ADD CONSTRAINT "events_locationId_fkey"
    FOREIGN KEY ("locationId") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropIndex: events_city_idx and events_latitude_longitude_idx
DROP INDEX IF EXISTS "events_city_idx";
DROP INDEX IF EXISTS "events_latitude_longitude_idx";

-- AlterTable: drop columns moved to places
ALTER TABLE "events"
    DROP COLUMN "placeId",
    DROP COLUMN "formattedAddress",
    DROP COLUMN "city",
    DROP COLUMN "country",
    DROP COLUMN "postalCode",
    DROP COLUMN "locationMetadata",
    DROP COLUMN "latitude",
    DROP COLUMN "longitude";
