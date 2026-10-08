"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function HistoricalCasesFilters() {
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

      {isPending && (
        <div className="absolute right-[15px] top-[15px] bottom-[15px] flex items-center gap-[6px] text-[11px] text-[var(--ink-3)] font-bold uppercase tracking-widest">
          <svg className="animate-spin h-3 w-3 text-[var(--ink-3)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating...
        </div>
      )}
    </div>
  );
}
