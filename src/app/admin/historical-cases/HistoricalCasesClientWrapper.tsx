"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import HistoricalCasesList from "./HistoricalCasesList";
import { HistoricalSupportCase } from "@prisma/client";
import HistoricalCasesSkeleton from "./HistoricalCasesSkeleton";

export default function HistoricalCasesClientWrapper({
  cases,
  totalFilteredCount,
  totalCount
}: {
  cases: HistoricalSupportCase[];
  totalFilteredCount: number;
  totalCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const source = searchParams.get("source") || "ALL";
  const review = searchParams.get("review") || "ALL";
  const extraction = searchParams.get("extraction") || "ALL";

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters = searchParams.toString() !== "";

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Filters */}
      <div className={`bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[15px] flex flex-wrap gap-[15px] items-center relative ${isPending ? 'opacity-70' : ''}`}>
        <div className="text-[12px] font-bold tracking-widest uppercase text-[var(--ink-3)]">Filters:</div>
        
        <div className="flex gap-[6px] items-center">
          <span className="text-[12px] text-[var(--ink-2)]">Source:</span>
          {["ALL", "RICHPANEL", "GHL"].map(val => (
            <button 
              key={val} 
              onClick={() => handleFilter("source", val)}
              className={`text-[11px] font-display font-semibold uppercase tracking-wider px-[8px] py-[3px] rounded-[4px] cursor-pointer ${
                source === val ? 'bg-[var(--ink)] text-[var(--ground)]' : 'bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--line)]'
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        <div className="flex gap-[6px] items-center">
          <span className="text-[12px] text-[var(--ink-2)]">Review:</span>
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map(val => (
            <button 
              key={val} 
              onClick={() => handleFilter("review", val)}
              className={`text-[11px] font-display font-semibold uppercase tracking-wider px-[8px] py-[3px] rounded-[4px] cursor-pointer ${
                review === val ? 'bg-[var(--ink)] text-[var(--ground)]' : 'bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--line)]'
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        <div className="flex gap-[6px] items-center">
          <span className="text-[12px] text-[var(--ink-2)]">Extraction:</span>
          {["ALL", "NOT_PROCESSED", "PROCESSING", "READY", "FAILED"].map(val => (
            <button 
              key={val} 
              onClick={() => handleFilter("extraction", val)}
              className={`text-[11px] font-display font-semibold uppercase tracking-wider px-[8px] py-[3px] rounded-[4px] cursor-pointer ${
                extraction === val ? 'bg-[var(--ink)] text-[var(--ground)]' : 'bg-[var(--surface-2)] text-[var(--ink-2)] hover:bg-[var(--line)]'
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button 
            onClick={handleClear}
            className="ml-auto text-[11px] font-bold px-[8px] py-[4px] text-[var(--ink-3)] hover:text-[var(--ink)] underline cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
      
      {/* Counts */}
      <div className="text-[12.5px] font-bold text-[var(--ink-3)] tracking-wide">
        {totalFilteredCount === totalCount ? (
          `${totalCount} historical cases`
        ) : (
          `${totalFilteredCount} of ${totalCount} historical cases`
        )}
      </div>

      {/* Results */}
      <div className="overflow-x-auto border border-[var(--line)] rounded-[var(--radius)] bg-[var(--surface)] relative min-h-[200px]">
        {isPending ? (
          <HistoricalCasesSkeleton />
        ) : (
          <HistoricalCasesList cases={cases} />
        )}
      </div>
    </div>
  );
}
