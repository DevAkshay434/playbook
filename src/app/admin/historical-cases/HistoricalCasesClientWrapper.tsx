"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import HistoricalCasesList from "./HistoricalCasesList";
import { HistoricalSupportCase } from "@prisma/client";
import HistoricalCasesSkeleton from "./HistoricalCasesSkeleton";

export default function HistoricalCasesClientWrapper({
  cases,
  totalFilteredCount,
  totalCount,
  currentPage,
  totalPages,
  q
}: {
  cases: HistoricalSupportCase[];
  totalFilteredCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  q: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

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
    params.delete("page"); // reset to page 1
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
    } else {
      params.delete("q");
    }
    params.delete("page"); // reset to page 1

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setSearchInput("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters = searchParams.toString() !== "";

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Filters and Search */}
      <div className={`bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[15px] flex flex-col gap-[15px] relative ${isPending ? 'opacity-70' : ''}`}>
        
        <div className="flex items-center gap-[10px] w-full max-w-[500px]">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-[5px]">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Subject or Ticket Number..."
              className="flex-1 text-[13px] p-[8px_12px] rounded-[4px] border border-[var(--line)] bg-[var(--ground)] focus:border-[var(--accent)] outline-none"
            />
            <button type="submit" className="text-[12px] bg-[var(--surface-2)] border border-[var(--line)] px-[12px] rounded-[4px] font-bold hover:bg-[var(--line)]">Search</button>
          </form>
        </div>

        <div className="flex flex-wrap gap-[15px] items-center">
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
      </div>
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center text-[12.5px] font-bold text-[var(--ink-3)] tracking-wide">
        <div>
          {totalFilteredCount === totalCount ? (
            `${totalCount} historical cases`
          ) : (
            `${totalFilteredCount} of ${totalCount} historical cases`
          )}
        </div>
        <div className="flex gap-[10px] items-center">
          <button 
            disabled={currentPage <= 1 || isPending} 
            onClick={() => handlePage(currentPage - 1)}
            className="px-[12px] py-[4px] rounded-[4px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] disabled:opacity-50"
          >
            Prev
          </button>
          <span className="font-mono text-[11px]">Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage >= totalPages || isPending} 
            onClick={() => handlePage(currentPage + 1)}
            className="px-[12px] py-[4px] rounded-[4px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)] disabled:opacity-50"
          >
            Next
          </button>
        </div>
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
