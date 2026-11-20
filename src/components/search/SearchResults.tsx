"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { logSearch, performSearch, UnifiedSearchResult } from "@/app/actions/search";
import { searchPlaybooks } from "@/lib/search-static";
import { Playbook } from "@/types/playbook";
import PlaybookDetail from "@/components/playbook/PlaybookDetail";
import { CaseCard } from "@/components/cases/CaseCard";
import Link from "next/link";

interface SearchResultsProps {
  query: string;
  allPlaybooks?: any[];
  categoryFilter?: string;
  authorityFilter?: string;
}

export default function SearchResults({
  query,
  allPlaybooks = [],
  categoryFilter,
  authorityFilter,
}: SearchResultsProps) {
  const [serverResults, setServerResults] = useState<UnifiedSearchResult[]>([]);
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [hasServerSearched, setHasServerSearched] = useState(false);
  const requestIdRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const trimmedQuery = query.trim();

  // 1. Instant 0ms client-side filtering for official Playbook entries
  const clientMatchingPlaybooks = useMemo(() => {
    if (!trimmedQuery) return [];
    if (allPlaybooks && allPlaybooks.length > 0) {
      const q = trimmedQuery.toLowerCase();
      return allPlaybooks
        .filter((p) => {
          const okL = !authorityFilter || p.authority?.toLowerCase() === authorityFilter.toLowerCase();
          const okS = !categoryFilter || p.category?.slug === categoryFilter || p.categoryId === categoryFilter || p.category === categoryFilter;
          return okL && okS;
        })
        .map((p) => {
          let score = 0;
          const title = (p.title || "").toLowerCase();
          if (title === q) score += 100;
          else if (title.includes(q)) score += 50;

          if (p.customerPhrases?.some((phrase: string) => phrase.toLowerCase().includes(q))) {
            score += 80;
          }
          if (p.aliases?.some((alias: string) => alias.toLowerCase().includes(q))) {
            score += 60;
          }
          const content = [...(p.facts || []), ...(p.troubleshootingSteps || [])].join(" ").toLowerCase();
          if (content.includes(q)) {
            score += 20;
          }
          return { playbook: p, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.playbook);
    }
    return searchPlaybooks(trimmedQuery, categoryFilter, authorityFilter);
  }, [trimmedQuery, allPlaybooks, categoryFilter, authorityFilter]);

  // 2. Debounced server fetch for Knowledge Base and Historical Cases with monotonic request sequencing
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!trimmedQuery) {
      requestIdRef.current++;
      setServerResults([]);
      setIsServerLoading(false);
      setHasServerSearched(false);
      return;
    }

    setIsServerLoading(true);

    // 350ms debounce before hitting server actions
    timerRef.current = setTimeout(() => {
      const thisReqId = ++requestIdRef.current;

      performSearch(trimmedQuery, categoryFilter, authorityFilter)
        .then((res) => {
          // If a newer query was fired while this was in-flight, discard stale result
          if (thisReqId !== requestIdRef.current) {
            return;
          }
          setServerResults(res);
          setIsServerLoading(false);
          setHasServerSearched(true);

          // Analytics log (debounced 1s)
          setTimeout(() => {
            if (thisReqId === requestIdRef.current) {
              logSearch(trimmedQuery, categoryFilter || "", authorityFilter || "", res.length);
            }
          }, 1000);
        })
        .catch((err) => {
          if (thisReqId === requestIdRef.current) {
            console.error("[Search Error]", err);
            setServerResults([]);
            setIsServerLoading(false);
            setHasServerSearched(true);
          }
        });
    }, 350);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [trimmedQuery, categoryFilter, authorityFilter]);

  if (!trimmedQuery) return null;

  const kbArticles = serverResults.filter((r) => r.type === "kb_article");
  const historicalCases = serverResults.filter((r) => r.type === "historical_case").slice(0, 5);

  const totalResultsCount =
    clientMatchingPlaybooks.length + kbArticles.length + historicalCases.length;

  if (totalResultsCount === 0 && !isServerLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-[40px_20px] bg-[var(--surface)] border border-dashed border-[var(--line)] rounded-[var(--radius)] text-center mt-[10px]">
        <p className="font-display font-semibold text-[15px] text-[var(--ink)] m-0">
          No resources found matching &ldquo;{trimmedQuery}&rdquo;
        </p>
        <p className="text-[13px] text-[var(--ink-2)] mt-[6px] max-w-[50ch]">
          Try searching what the customer said (e.g. &ldquo;overnight&rdquo;, &ldquo;too small&rdquo;, &ldquo;upside down&rdquo;) or check active category filters.
        </p>
        <p className="text-[12.5px] text-[var(--ink-3)] mt-[10px]">
          If you resolved this case anyway,{" "}
          <Link href="#contribute" className="text-[var(--accent)] hover:underline">
            submit it below
          </Link>{" "}
          so future agents have standard guidance.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[30px] mt-[10px]">
      {/* Official Playbooks Section (Instant Client-Side Match) */}
      {clientMatchingPlaybooks.length > 0 && (
        <div className="flex flex-col gap-[12px]">
          <div className="flex justify-between items-center px-[4px]">
            <h3 className="font-display font-bold text-[11px] tracking-[0.16em] uppercase text-[var(--ink-3)]">
              Official Playbooks ({clientMatchingPlaybooks.length})
            </h3>
            <span className="font-mono text-[11px] text-[var(--ok)] bg-[var(--ok-soft)] px-[6px] py-[2px] rounded-[3px]">
              Instant match
            </span>
          </div>

          <div className="flex flex-col gap-[10px]">
            {clientMatchingPlaybooks.map((p: any) => {
              const pAuth = p.authority?.toLowerCase();
              let authClass = "border-l-[var(--stop)]";
              let badgeClass = "bg-[var(--stop-soft)] text-[var(--stop)]";
              let displayAuth = "Escalate";

              if (pAuth === "resolve") {
                authClass = "border-l-[var(--ok)]";
                badgeClass = "bg-[var(--ok-soft)] text-[var(--ok)]";
                displayAuth = "Handle it";
              } else if (pAuth === "judge") {
                authClass = "border-l-[var(--warn)]";
                badgeClass = "bg-[var(--warn-soft)] text-[var(--warn)]";
                displayAuth = "Your call";
              }

              return (
                <details
                  key={p.id || p.slug}
                  open={clientMatchingPlaybooks.length <= 2}
                  className={`bg-[var(--surface)] border border-[var(--line)] border-l-[3px] ${authClass} rounded-[var(--radius)] overflow-hidden group shadow-[var(--shadow)]`}
                >
                  <summary className="w-full bg-transparent border-0 text-left cursor-pointer p-[14px_16px] flex gap-[13px] items-start hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:-outline-offset-2 list-none [&::-webkit-details-marker]:hidden">
                    <div className="flex-none mt-[4px] w-[9px] h-[9px] border-r-[1.6px] border-b-[1.6px] border-[var(--ink-3)] -rotate-45 transition-transform duration-160 group-open:rotate-45" />
                    <div className="flex flex-col gap-[5px] min-w-0 flex-1">
                      <h4 className="text-[15.5px] font-semibold tracking-[-0.005em] leading-[1.35] text-[var(--ink)] m-0">
                        {p.title}
                      </h4>
                      {p.customerPhrases && p.customerPhrases.length > 0 && (
                        <div className="text-[12.5px] text-[var(--ink-3)] italic">
                          &ldquo;{p.customerPhrases[0]}&rdquo;
                        </div>
                      )}
                    </div>
                    <div className="flex gap-[6px] flex-wrap items-center flex-none pt-[1px]">
                      <span
                        className={`font-display font-bold text-[9.5px] tracking-[0.1em] uppercase rounded-[4px] px-[7px] py-[3px] whitespace-nowrap ${badgeClass}`}
                      >
                        {displayAuth}
                      </span>
                    </div>
                  </summary>

                  <div className="p-[2px_16px_18px_16px] flex flex-col gap-[15px] border-t border-[var(--line-soft)] mt-0 pt-[16px]">
                    <PlaybookDetail playbook={p} />
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}

      {/* Server Loading Spinner */}
      {isServerLoading && (
        <div className="flex items-center gap-[8px] py-[8px] px-[12px] bg-[var(--surface-2)] border border-[var(--line)] rounded-[6px] font-mono text-[12px] text-[var(--ink-2)] animate-pulse">
          <span className="w-[8px] h-[8px] rounded-full bg-[var(--accent)] animate-ping"></span>
          Searching Knowledge Base &amp; Historical Cases...
        </div>
      )}

      {/* Related Knowledge Base */}
      {kbArticles.length > 0 && (
        <div className="flex flex-col gap-[10px]">
          <h3 className="font-display font-bold text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)] px-[5px]">
            Related Knowledge Base ({kbArticles.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
            {kbArticles.map((a: any) => (
              <a
                key={a.id}
                href={a.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[15px] hover:border-[var(--accent)] hover:shadow-[var(--shadow-hover)] transition-all no-underline"
              >
                <div className="flex justify-between items-start mb-[8px]">
                  <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] bg-[var(--line)] px-[6px] py-[3px] rounded-[4px]">
                    Knowledge Base
                  </span>
                </div>
                <h4 className="font-bold text-[14px] text-[var(--ink)] m-0 leading-tight mb-[6px]">
                  {a.title}
                </h4>
                {a.excerpt && (
                  <p className="text-[12px] text-[var(--ink-2)] m-0 line-clamp-2">
                    {a.excerpt}
                  </p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Historical Resolved Cases */}
      {historicalCases.length > 0 && (
        <div className="flex flex-col gap-[10px]">
          <h3 className="font-display font-bold text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)] px-[5px]">
            Historical Resolved Cases ({historicalCases.length})
          </h3>
          <div className="flex flex-col gap-[10px]">
            {historicalCases.map((c: any) => (
              <CaseCard
                key={c.id}
                c={{
                  id: c.id,
                  source: c.source || "Unknown",
                  ticketId: c.ticketId,
                  issueSummary: c.title || c.excerpt || "Resolved Support Case",
                  resolutionSummary: c.resolutionSummary,
                  resolvedDate: c.resolvedDate,
                  tags: c.tags,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
