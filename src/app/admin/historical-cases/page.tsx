import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import HistoricalCasesList from './HistoricalCasesList';
import SyncButton from './SyncButton';
import { requireActiveDbUser } from '@/lib/server-auth';
import { isManager } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SupportCaseSource, HistoricalCaseReviewStatus, HistoricalCaseExtractionStatus } from '@prisma/client';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Historical Support Cases',
};

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
  if (source && source !== "ALL") {
    filters.source = source as SupportCaseSource;
  }
  if (review && review !== "ALL") {
    filters.reviewStatus = review as HistoricalCaseReviewStatus;
  }
  if (extraction && extraction !== "ALL") {
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

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[10px]">
        <div className="flex flex-col gap-[3px]">
          <h2 className="text-[26px] font-bold tracking-[-0.015em]">Historical Support Cases</h2>
          <p className="text-[var(--ink-2)] text-[13.5px]">Review and normalize historical tickets from Richpanel and GHL.</p>
        </div>
        <div className="flex items-center gap-[10px]">
          <form action={async () => {
            "use server";
            const { extractNext5 } = await import("./actions");
            await extractNext5();
          }}>
            <button type="submit" className="bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)] text-[13px] font-bold p-[9px_15px] rounded-[4px] hover:bg-[var(--line)] disabled:opacity-50 cursor-pointer">
              Extract Next 5
            </button>
          </form>
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

      {/* Filters */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[15px] flex flex-wrap gap-[15px] items-center">
        <div className="text-[12px] font-bold tracking-widest uppercase text-[var(--ink-3)]">Filters:</div>
        
        <div className="flex gap-[6px] items-center">
          <span className="text-[12px] text-[var(--ink-2)]">Source:</span>
          {["ALL", "RICHPANEL", "GHL"].map(val => (
            <Link key={val} href={`?source=${val}&review=${review || 'ALL'}&extraction=${extraction || 'ALL'}`} 
                  className={`text-[11px] font-display font-semibold uppercase tracking-wider px-[8px] py-[3px] rounded-[4px] no-underline ${(!source && val === "ALL") || source === val ? 'bg-[var(--ink)] text-[var(--ground)]' : 'bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--line)]'}`}>
              {val}
            </Link>
          ))}
        </div>

        <div className="flex gap-[6px] items-center">
          <span className="text-[12px] text-[var(--ink-2)]">Review:</span>
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map(val => (
            <Link key={val} href={`?source=${source || 'ALL'}&review=${val}&extraction=${extraction || 'ALL'}`} 
                  className={`text-[11px] font-display font-semibold uppercase tracking-wider px-[8px] py-[3px] rounded-[4px] no-underline ${(!review && val === "ALL") || review === val ? 'bg-[var(--ink)] text-[var(--ground)]' : 'bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--line)]'}`}>
              {val}
            </Link>
          ))}
        </div>

        <div className="flex gap-[6px] items-center">
          <span className="text-[12px] text-[var(--ink-2)]">Extraction:</span>
          {["ALL", "NOT_PROCESSED", "READY", "FAILED"].map(val => (
            <Link key={val} href={`?source=${source || 'ALL'}&review=${review || 'ALL'}&extraction=${val}`} 
                  className={`text-[11px] font-display font-semibold uppercase tracking-wider px-[8px] py-[3px] rounded-[4px] no-underline ${(!extraction && val === "ALL") || extraction === val ? 'bg-[var(--ink)] text-[var(--ground)]' : 'bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--line)]'}`}>
              {val}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border border-[var(--line)] rounded-[var(--radius)] bg-[var(--surface)]">
        <HistoricalCasesList cases={cases} />
      </div>
    </div>
  );
}
