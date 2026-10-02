-- CreateEnum
CREATE TYPE "SyncTrigger" AS ENUM ('MANUAL', 'CRON');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "SearchEvent" ADD COLUMN     "normalizedQuery" TEXT,
ADD COLUMN     "selectedResultId" TEXT,
ADD COLUMN     "selectedResultType" TEXT;

-- CreateTable
CREATE TABLE "PlaybookKnowledgeBaseArticle" (
    "id" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "knowledgeBaseArticleId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaybookKnowledgeBaseArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseSyncRun" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'wordpress',
    "status" "SyncStatus" NOT NULL DEFAULT 'RUNNING',
    "triggeredBy" "SyncTrigger" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalFetched" INTEGER NOT NULL DEFAULT 0,
    "addedCount" INTEGER NOT NULL DEFAULT 0,
    "updatedCount" INTEGER NOT NULL DEFAULT 0,
    "deactivatedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "KnowledgeBaseSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlaybookKnowledgeBaseArticle_playbookId_knowledgeBaseArticl_key" ON "PlaybookKnowledgeBaseArticle"("playbookId", "knowledgeBaseArticleId");

-- AddForeignKey
ALTER TABLE "PlaybookKnowledgeBaseArticle" ADD CONSTRAINT "PlaybookKnowledgeBaseArticle_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookKnowledgeBaseArticle" ADD CONSTRAINT "PlaybookKnowledgeBaseArticle_knowledgeBaseArticleId_fkey" FOREIGN KEY ("knowledgeBaseArticleId") REFERENCES "KnowledgeBaseArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookKnowledgeBaseArticle" ADD CONSTRAINT "PlaybookKnowledgeBaseArticle_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
