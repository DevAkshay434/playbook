-- AlterEnum
ALTER TYPE "HistoricalCaseExtractionStatus" ADD VALUE 'PROCESSING';

-- AlterTable
ALTER TABLE "HistoricalSupportCase" ADD COLUMN     "confidence" INTEGER,
ADD COLUMN     "evidenceQuality" TEXT,
ADD COLUMN     "extractedAt" TIMESTAMP(3),
ADD COLUMN     "extractionVersion" TEXT,
ADD COLUMN     "usableAsHistoricalCase" BOOLEAN;

