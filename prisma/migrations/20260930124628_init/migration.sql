-- CreateEnum
CREATE TYPE "Role" AS ENUM ('AGENT', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TicketSource" AS ENUM ('RICHPANEL', 'GHL', 'OTHER');

-- CreateEnum
CREATE TYPE "ResolutionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'AGENT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playbook" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "summary" TEXT,
    "customerPhrases" TEXT[],
    "aliases" TEXT[],
    "facts" TEXT[],
    "troubleshootingSteps" TEXT[],
    "suggestedResponse" TEXT,
    "dontDo" TEXT[],
    "source" TEXT,
    "lastConfirmed" TEXT,
    "knownGap" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyReference" (
    "id" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "url" TEXT,
    "description" TEXT,

    CONSTRAINT "PolicyReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorityRule" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "ceiling" TEXT,
    "confirm" BOOLEAN NOT NULL DEFAULT false,
    "cond" TEXT,

    CONSTRAINT "AuthorityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "policy" TEXT NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resolution" (
    "id" TEXT NOT NULL,
    "customerIssue" TEXT NOT NULL,
    "ticketId" TEXT,
    "ticketSource" "TicketSource" NOT NULL,
    "symptoms" TEXT,
    "troubleshootingPerformed" TEXT,
    "finalResolution" TEXT NOT NULL,
    "refundCreditAmount" TEXT,
    "notesForFutureAgents" TEXT,
    "relatedPlaybookId" TEXT,
    "submittedByUserId" TEXT NOT NULL,
    "status" "ResolutionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedByUserId" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Resolution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaybookVersion" (
    "id" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changedByUserId" TEXT NOT NULL,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaybookVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "categoryFilter" TEXT,
    "authorityFilter" TEXT,
    "resultCount" INTEGER NOT NULL,
    "selectedPlaybookId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Playbook_slug_key" ON "Playbook"("slug");

-- AddForeignKey
ALTER TABLE "Playbook" ADD CONSTRAINT "Playbook_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyReference" ADD CONSTRAINT "PolicyReference_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resolution" ADD CONSTRAINT "Resolution_relatedPlaybookId_fkey" FOREIGN KEY ("relatedPlaybookId") REFERENCES "Playbook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resolution" ADD CONSTRAINT "Resolution_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resolution" ADD CONSTRAINT "Resolution_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookVersion" ADD CONSTRAINT "PlaybookVersion_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "Playbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybookVersion" ADD CONSTRAINT "PlaybookVersion_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchEvent" ADD CONSTRAINT "SearchEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
