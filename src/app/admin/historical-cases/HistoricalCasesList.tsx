"use client";

import { HistoricalSupportCase } from "@prisma/client";
import CaseRow from "./CaseRow";

export default function HistoricalCasesList({ cases }: { cases: HistoricalSupportCase[] }) {
  if (cases.length === 0) {
    return <div className="p-[20px] text-center text-[13.5px] text-[var(--ink-3)]">No historical cases found matching the current filters.</div>;
  }

  return (
    <table className="w-full min-w-[800px] border-collapse text-[13.5px]">
      <thead>
        <tr>
          <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Source & ID</th>
          <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Subject & Tags</th>
          <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Resolved</th>
          <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">States</th>
          <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Review Actions</th>
        </tr>
      </thead>
      <tbody>
        {cases.map((c) => (
          <CaseRow key={c.id} c={c} />
        ))}
      </tbody>
    </table>
  );
}
