import { ResolvedCase, CaseCard } from "./CaseCard";

interface SimilarResolvedCasesProps {
  cases: ResolvedCase[];
}

/**
 * Displays similar resolved support cases from any source (Richpanel, GHL, etc.).
 * Shows a clean empty state when no historical data is connected yet.
 */
export default function SimilarResolvedCases({ cases }: SimilarResolvedCasesProps) {
  return (
    <section className="bg-[var(--surface-2)] border border-[var(--line)] rounded-[var(--radius)] p-[20px] mt-[20px]">
      <h2 className="font-display font-bold text-[11px] tracking-[0.15em] uppercase text-[var(--ink-2)] mb-[15px]">
        Similar Resolved Cases
      </h2>

      {cases.length === 0 ? (
        <div className="text-center py-[20px] px-[15px] bg-[var(--surface)] border border-dashed border-[var(--line)] rounded-[6px]">
          <p className="text-[13px] text-[var(--ink-3)] m-0">
            Historical support cases have not been connected yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[10px]">
          {cases.map(c => (
            <CaseCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </section>
  );
}
