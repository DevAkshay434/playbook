/**
 * Reusable case card for displaying historical resolved support cases.
 * Data-source agnostic — works with Richpanel, GHL, or any future source.
 */

export interface ResolvedCase {
  id: string;
  source: string;        // e.g. "richpanel", "ghl"
  ticketId?: string;
  issueSummary: string;
  resolutionSummary?: string;
  resolvedDate?: string;
  tags?: string[];
  sourceUrl?: string;
}

export function CaseCard({ c }: { c: ResolvedCase }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[6px] p-[12px] flex flex-col gap-[6px]">
      <div className="flex items-center gap-[6px]">
        <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] bg-[var(--line)] px-[5px] py-[2px] rounded-[3px]">
          {c.source}
        </span>
        {c.ticketId && (
          <span className="font-mono text-[11px] text-[var(--ink-3)]">#{c.ticketId}</span>
        )}
        {c.resolvedDate && (
          <span className="font-mono text-[11px] text-[var(--ink-3)] ml-auto">{c.resolvedDate}</span>
        )}
      </div>
      <p className="text-[13px] text-[var(--ink)] font-semibold m-0 leading-snug">{c.issueSummary}</p>
      {c.resolutionSummary && (
        <p className="text-[12px] text-[var(--ink-2)] m-0 line-clamp-2">{c.resolutionSummary}</p>
      )}
      {c.tags && c.tags.length > 0 && (
        <div className="flex gap-[4px] flex-wrap">
          {c.tags.map(t => (
            <span key={t} className="text-[10px] font-display uppercase tracking-wider text-[var(--ink-3)] bg-[var(--ground)] px-[5px] py-[1px] rounded-[3px] border border-[var(--line)]">{t}</span>
          ))}
        </div>
      )}
      {c.sourceUrl && (
        <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="text-[11px] text-[var(--accent)] hover:underline self-start">
          View original ticket
        </a>
      )}
    </div>
  );
}
