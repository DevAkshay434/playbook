-- CreateEnum
CREATE TYPE "SupportCaseSource" AS ENUM ('RICHPANEL', 'GHL');

-- CreateEnum
CREATE TYPE "HistoricalCaseExtractionStatus" AS ENUM ('NOT_PROCESSED', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "HistoricalCaseReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "HistoricalSupportCase" (
    "id" TEXT NOT NULL,
    "source" "SupportCaseSource" NOT NULL,
    "externalId" TEXT NOT NULL,
    "externalNumber" TEXT,
    "subject" TEXT,
    "issueText" TEXT,
    "symptoms" TEXT,
    "troubleshooting" TEXT,
    "resolutionText" TEXT,
    "status" TEXT,
    "topic" TEXT,
    "channel" TEXT,
    "tags" JSONB,
    "sourceUrl" TEXT,
    "openedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "sourceUpdatedAt" TIMESTAMP(3),
    "extractionStatus" "HistoricalCaseExtractionStatus" NOT NULL DEFAULT 'NOT_PROCESSED',
    "reviewStatus" "HistoricalCaseReviewStatus" NOT NULL DEFAULT 'PENDING',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoricalSupportCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSyncState" (
    "id" TEXT NOT NULL,
    "source" "SupportCaseSource" NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'RUNNING',
    "triggeredBy" "SyncTrigger" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastSourceTimestamp" TIMESTAMP(3),
    "recordsScanned" INTEGER NOT NULL DEFAULT 0,
    "recordsInserted" INTEGER NOT NULL DEFAULT 0,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsSkipped" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "IntegrationSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HistoricalSupportCase_source_resolvedAt_idx" ON "HistoricalSupportCase"("source", "resolvedAt");

-- CreateIndex
CREATE INDEX "HistoricalSupportCase_reviewStatus_idx" ON "HistoricalSupportCase"("reviewStatus");

-- CreateIndex
CREATE UNIQUE INDEX "HistoricalSupportCase_source_externalId_key" ON "HistoricalSupportCase"("source", "externalId");

