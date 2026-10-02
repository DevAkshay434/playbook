-- CreateTable
CREATE TABLE "KnowledgeBaseArticle" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'wordpress',
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "contentText" TEXT NOT NULL,
    "contentHtml" TEXT,
    "url" TEXT NOT NULL,
    "featuredImageUrl" TEXT,
    "wordpressModifiedAt" TIMESTAMP(3) NOT NULL,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeBaseArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseArticle_externalId_key" ON "KnowledgeBaseArticle"("externalId");
