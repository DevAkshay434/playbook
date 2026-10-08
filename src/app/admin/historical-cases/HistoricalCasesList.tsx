"use client";

import { HistoricalSupportCase } from "@prisma/client";
import { setReviewStatus } from "./actions";

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
          <tr key={c.id} className="[&:last-child_td]:border-b-0 hover:bg-[var(--ground)]">
            <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
              <div className="flex flex-col gap-[2px]">
                <span className="font-display font-bold text-[10px] tracking-widest uppercase text-[var(--ink-2)]">{c.source}</span>
                <span className="font-mono text-[11px] text-[var(--ink-3)]">
                  {c.sourceUrl ? (
                    <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                      #{c.externalNumber || c.externalId}
                    </a>
                  ) : (
                    `#${c.externalNumber || c.externalId}`
                  )}
                </span>
              </div>
            </td>
            <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
              <div className="flex flex-col gap-[6px]">
                <span className="font-semibold">{c.subject || "(No Subject)"}</span>
                <div className="flex flex-wrap gap-[4px]">
                  {Array.isArray(c.tags) && c.tags.map((t: any, i) => (
                    <span key={i} className="font-display font-bold text-[9px] tracking-wider uppercase rounded-[4px] px-[6px] py-[2px] bg-[var(--surface-2)] text-[var(--ink-2)] border border-[var(--line-soft)]">
                      {String(t)}
                    </span>
                  ))}
                </div>
              </div>
            </td>
            <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top font-mono text-[11px] text-[var(--ink-3)]">
              {c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : 'N/A'}
            </td>
            <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
              <div className="flex flex-col gap-[6px]">
                <div className="flex items-center gap-[6px]">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--ink-3)]">Extract:</span>
                  <span className={`font-display font-bold text-[9px] tracking-[0.1em] uppercase rounded-[4px] px-[6px] py-[2px] ${
                    c.extractionStatus === 'READY' ? 'bg-[var(--ok-soft)] text-[var(--ok)]' : 
                    c.extractionStatus === 'FAILED' ? 'bg-[var(--stop-soft)] text-[var(--stop)]' : 
                    'bg-[var(--surface-2)] text-[var(--ink-2)]'
                  }`}>
                    {c.extractionStatus}
                  </span>
                </div>
                <div className="flex items-center gap-[6px]">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--ink-3)]">Review:</span>
                  <span className={`font-display font-bold text-[9px] tracking-[0.1em] uppercase rounded-[4px] px-[6px] py-[2px] ${
                    c.reviewStatus === 'APPROVED' ? 'bg-[var(--ok-soft)] text-[var(--ok)]' : 
                    c.reviewStatus === 'REJECTED' ? 'bg-[var(--warn-soft)] text-[var(--warn)]' : 
                    'bg-[var(--surface-2)] text-[var(--ink-2)]'
                  }`}>
                    {c.reviewStatus}
                  </span>
                </div>
              </div>
            </td>
            <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
              <div className="flex gap-[6px]">
                <form action={async () => {
                  try {
                    await setReviewStatus(c.id, "APPROVED");
                  } catch (e: any) {
                    alert(e.message || "Failed to approve");
                  }
                }}>
                  <button type="submit" disabled={c.reviewStatus === 'APPROVED'} className="text-[11px] font-bold px-[8px] py-[4px] rounded-[4px] bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--ok)] hover:text-[var(--ok)] disabled:opacity-50 cursor-pointer">
                    Approve
                  </button>
                </form>

                <form action={async () => {
                  try {
                    await setReviewStatus(c.id, "REJECTED");
                  } catch (e: any) {
                    alert(e.message || "Failed to reject");
                  }
                }}>
                  <button type="submit" disabled={c.reviewStatus === 'REJECTED'} className="text-[11px] font-bold px-[8px] py-[4px] rounded-[4px] bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--warn)] hover:text-[var(--warn)] disabled:opacity-50 cursor-pointer">
                    Reject
                  </button>
                </form>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
