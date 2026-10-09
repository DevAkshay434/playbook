import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import SyncButton from './SyncButton';
import { requireActiveDbUser } from '@/lib/server-auth';
import { isManager } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SupportCaseSource, HistoricalCaseReviewStatus, HistoricalCaseExtractionStatus } from '@prisma/client';
import HistoricalCasesClientWrapper from './HistoricalCasesClientWrapper';
import ExtractNextButton from './ExtractNextButton';
import { recoverStaleProcessing } from './actions';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Historical Support Cases',
};

const validSources = Object.values(SupportCaseSource);
const validReviewStatuses = Object.values(HistoricalCaseReviewStatus);
const validExtractionStatuses = Object.values(HistoricalCaseExtractionStatus);

export default async function HistoricalCasesPage({
  searchParams,
}: {
  searchParams: { source?: string; review?: string; extraction?: string; page?: string; q?: string };
}) {
  const { dbUser } = await requireActiveDbUser();
  if (!isManager(dbUser.role)) {
    redirect("/admin");
  }

  // 1. Recover any stale PROCESSING cases automatically
  await recoverStaleProcessing();

  const { source, review, extraction, page, q } = searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const PAGE_SIZE = 25;

  const filters: any = { active: true }; // Only show active cases
  
  if (source && validSources.includes(source as SupportCaseSource)) {
    filters.source = source as SupportCaseSource;
  }
  
  if (review && validReviewStatuses.includes(review as HistoricalCaseReviewStatus)) {
    filters.reviewStatus = review as HistoricalCaseReviewStatus;
  }
  
  if (extraction && validExtractionStatuses.includes(extraction as HistoricalCaseExtractionStatus)) {
    filters.extractionStatus = extraction as HistoricalCaseExtractionStatus;
  }

  if (q) {
    filters.OR = [
      { subject: { contains: q, mode: 'insensitive' } },
      { externalNumber: { contains: q, mode: 'insensitive' } }
    ];
  }

  // 2. Fetch data in parallel
  const [
    cases,
    lastSync,
    totalFilteredCount,
    totalCount,
    totalPending,
    totalApproved,
    totalFailed,
    totalReady
  ] = await Promise.all([
    prisma.historicalSupportCase.findMany({
      where: filters,
      orderBy: { resolvedAt: 'desc' },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.integrationSyncState.findFirst({
      where: { source: "RICHPANEL" },
      orderBy: { startedAt: 'desc' }
    }),
    prisma.historicalSupportCase.count({ where: filters }),
    prisma.historicalSupportCase.count({ where: { active: true } }),
    prisma.historicalSupportCase.count({ where: { active: true, reviewStatus: "PENDING" } }),
    prisma.historicalSupportCase.count({ where: { active: true, reviewStatus: "APPROVED" } }),
    prisma.historicalSupportCase.count({ where: { active: true, extractionStatus: "FAILED" } }),
    prisma.historicalSupportCase.count({ where: { active: true, extractionStatus: "READY" } })
  ]);

  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / PAGE_SIZE));
  const aiConfigured = !!process.env.OPENAI_API_KEY;

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[10px]">
        <div className="flex flex-col gap-[3px]">
          <h2 className="text-[26px] font-bold tracking-[-0.015em]">Historical Support Cases</h2>
          <p className="text-[var(--ink-2)] text-[13.5px]">Review and normalize historical tickets from Richpanel and GHL.</p>
        </div>
        <div className="flex items-center gap-[10px]">
          <div className={`text-[12px] font-semibold px-[10px] py-[4px] rounded-[4px] border ${aiConfigured ? 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok)]' : 'bg-[var(--warn-soft)] text-[var(--warn)] border-[var(--warn)]'}`}>
            AI Extraction: {aiConfigured ? 'Ready' : 'Not Configured'}
          </div>
          <ExtractNextButton />
          <SyncButton />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex flex-wrap gap-[15px] p-[15px] border border-[var(--line)] rounded-[var(--radius)] bg-[var(--surface)]">
        <div className="flex flex-col min-w-[100px]">
          <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--ink-3)]">Total</span>
          <span className="text-[20px] font-bold">{totalCount}</span>
        </div>
        <div className="flex flex-col min-w-[100px]">
          <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--warn)]">Pending Review</span>
          <span className="text-[20px] font-bold">{totalPending}</span>
        </div>
        <div className="flex flex-col min-w-[100px]">
          <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--ok)]">Approved</span>
          <span className="text-[20px] font-bold">{totalApproved}</span>
        </div>
        <div className="flex flex-col min-w-[100px]">
          <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--ok)]">AI Ready</span>
          <span className="text-[20px] font-bold">{totalReady}</span>
        </div>
        <div className="flex flex-col min-w-[100px]">
          <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--stop)]">AI Failed</span>
          <span className="text-[20px] font-bold">{totalFailed}</span>
        </div>
      </div>

      {/* Sync Status */}
      {lastSync && (
        <div className={`p-[15px] border rounded-[6px] text-[13px] ${lastSync.status === 'SUCCESS' ? 'bg-[var(--ok-soft)] border-[var(--ok)] text-[var(--ok)]' : lastSync.status === 'FAILED' ? 'bg-[var(--stop-soft)] border-[var(--stop)] text-[var(--stop)]' : 'bg-[var(--surface-2)] border-[var(--line)]'}`}>
          <strong>Last Sync:</strong> {lastSync.status} at {lastSync.completedAt ? lastSync.completedAt.toLocaleString() : 'N/A'} 
          <span className="ml-[15px]">
            (Inserted: {lastSync.recordsInserted}, Updated: {lastSync.recordsUpdated}, Skipped: {lastSync.recordsSkipped}, Errors: {lastSync.recordsErrored})
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
        currentPage={currentPage}
        totalPages={totalPages}
        q={q || ""}
      />
    </div>
  );
}
