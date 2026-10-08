import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import SyncButton from './SyncButton';
import { requireActiveDbUser } from '@/lib/server-auth';
import { isManager } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SupportCaseSource, HistoricalCaseReviewStatus, HistoricalCaseExtractionStatus } from '@prisma/client';
import HistoricalCasesClientWrapper from './HistoricalCasesClientWrapper';
import ExtractNextButton from './ExtractNextButton';

export const metadata: Metadata = {
  title: 'Historical Support Cases',
};

// Valid Enum Lists
const validSources = Object.values(SupportCaseSource);
const validReviewStatuses = Object.values(HistoricalCaseReviewStatus);
const validExtractionStatuses = Object.values(HistoricalCaseExtractionStatus);

export default async function HistoricalCasesPage({
  searchParams,
}: {
  searchParams: { source?: string; review?: string; extraction?: string };
}) {
  const { dbUser } = await requireActiveDbUser();
  if (!isManager(dbUser.role)) {
    redirect("/admin");
  }

  const { source, review, extraction } = searchParams;

  const filters: any = {};
  
  if (source && validSources.includes(source as SupportCaseSource)) {
    filters.source = source as SupportCaseSource;
  }
  
  if (review && validReviewStatuses.includes(review as HistoricalCaseReviewStatus)) {
    filters.reviewStatus = review as HistoricalCaseReviewStatus;
  }
  
  if (extraction && validExtractionStatuses.includes(extraction as HistoricalCaseExtractionStatus)) {
    filters.extractionStatus = extraction as HistoricalCaseExtractionStatus;
  }

  const cases = await prisma.historicalSupportCase.findMany({
    where: filters,
    orderBy: {
      resolvedAt: 'desc',
    },
    take: 100,
  });

  const lastSync = await prisma.integrationSyncState.findFirst({
    where: { source: "RICHPANEL" },
    orderBy: { startedAt: 'desc' }
  });

  const totalFilteredCount = await prisma.historicalSupportCase.count({ where: filters });
  const totalCount = await prisma.historicalSupportCase.count();

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[10px]">
        <div className="flex flex-col gap-[3px]">
          <h2 className="text-[26px] font-bold tracking-[-0.015em]">Historical Support Cases</h2>
          <p className="text-[var(--ink-2)] text-[13.5px]">Review and normalize historical tickets from Richpanel and GHL.</p>
        </div>
        <div className="flex items-center gap-[10px]">
          <ExtractNextButton />
          <SyncButton />
        </div>
      </div>

      {lastSync && (
        <div className={`p-[15px] border rounded-[6px] text-[13px] ${lastSync.status === 'SUCCESS' ? 'bg-[var(--ok-soft)] border-[var(--ok)] text-[var(--ok)]' : lastSync.status === 'FAILED' ? 'bg-[var(--stop-soft)] border-[var(--stop)] text-[var(--stop)]' : 'bg-[var(--surface-2)] border-[var(--line)]'}`}>
          <strong>Last Sync:</strong> {lastSync.status} at {lastSync.completedAt ? lastSync.completedAt.toLocaleString() : 'N/A'} 
          <span className="ml-[15px]">
            (Inserted: {lastSync.recordsInserted}, Updated: {lastSync.recordsUpdated}, Skipped: {lastSync.recordsSkipped}, Errors: {lastSync.status === 'FAILED' ? 1 : 0})
          </span>
          {lastSync.errorMessage && (
            <div className="mt-[10px] font-mono text-[12px]">{lastSync.errorMessage}</div>
          )}
        </div>
      )}

      {/* Client Wrapper handles filters, loading skeleton, and list */}
      <HistoricalCasesClientWrapper 
        cases={cases} 
        totalFilteredCount={totalFilteredCount} 
        totalCount={totalCount} 
      />
    </div>
  );
}
