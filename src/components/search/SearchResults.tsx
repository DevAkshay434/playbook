"use client";
import { useEffect, useState } from "react";
import { logSearch, performSearch, UnifiedSearchResult } from "@/app/actions/search";
import Link from "next/link";

interface SearchResultsProps {
  query: string;
  categoryFilter?: string;
  authorityFilter?: string;
}

export default function SearchResults({ query, categoryFilter, authorityFilter }: SearchResultsProps) {
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let isMounted = true;

    performSearch(query, categoryFilter, authorityFilter).then((res) => {
      if (isMounted) {
        setResults(res);
        setHasSearched(true);
        setIsLoading(false);

        // debounce tracking
        setTimeout(() => {
          logSearch(query, categoryFilter || "", authorityFilter || "", res.length);
        }, 1000);
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, [query, categoryFilter, authorityFilter]);

  if (isLoading && !hasSearched) return null;

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-[40px_20px] bg-[var(--surface)] border border-dashed border-[var(--line)] rounded-[var(--radius)] text-center mt-[10px]">
        <p className="font-display font-semibold text-[14px] text-[var(--ink-2)] m-0">No resources found.</p>
        <p className="text-[13px] text-[var(--ink-3)] mt-[5px]">Try adjusting your search terms or filters.</p>
      </div>
    );
  }

  const playbooks = results.filter(r => r.type === "playbook");
  const kbArticles = results.filter(r => r.type === "kb_article");

  return (
    <div className="flex flex-col gap-[25px] mt-[10px]">
      {playbooks.length > 0 && (
        <div className="flex flex-col gap-[10px]">
          <h3 className="font-display font-bold text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)] px-[5px]">Official Playbooks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px]">
            {playbooks.map(p => (
              <Link key={p.id} href={`/playbook/${p.slug}`} className="flex flex-col bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[15px] hover:border-[var(--accent)] hover:shadow-[var(--shadow-hover)] transition-all no-underline">
                <div className="flex justify-between items-start mb-[8px]">
                  <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--accent)] bg-[var(--accent-soft)] px-[6px] py-[3px] rounded-[4px]">{p.categoryName}</span>
                  {p.authority === "Hard Stop" && <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--stop)] bg-[var(--stop-soft)] px-[6px] py-[3px] rounded-[4px]">Hard Stop</span>}
                </div>
                <h4 className="font-bold text-[15px] text-[var(--ink)] m-0 leading-tight group-hover:text-[var(--accent)]">{p.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}

      {kbArticles.length > 0 && (
        <div className="flex flex-col gap-[10px]">
          <h3 className="font-display font-bold text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)] px-[5px]">Related Knowledge Base</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
            {kbArticles.map(a => (
              <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="flex flex-col bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[15px] hover:border-[var(--accent)] hover:shadow-[var(--shadow-hover)] transition-all no-underline">
                <div className="flex justify-between items-start mb-[8px]">
                  <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] bg-[var(--line)] px-[6px] py-[3px] rounded-[4px]">Knowledge Base</span>
                </div>
                <h4 className="font-bold text-[14px] text-[var(--ink)] m-0 leading-tight mb-[6px]">{a.title}</h4>
                {a.excerpt && <p className="text-[12px] text-[var(--ink-2)] m-0 line-clamp-2">{a.excerpt}</p>}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
