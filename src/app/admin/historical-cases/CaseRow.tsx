"use client";

import { useTransition } from "react";
import { HistoricalSupportCase } from "@prisma/client";
import { setReviewStatus, extractCase } from "./actions";

export default function CaseRow({ c }: { c: HistoricalSupportCase }) {
  const [isPendingApprove, startApprove] = useTransition();
  const [isPendingReject, startReject] = useTransition();
  const [isPendingExtract, startExtract] = useTransition();

  const isGlobalPending = isPendingApprove || isPendingReject || isPendingExtract;

  const handleApprove = () => {
    startApprove(async () => {
      try {
        await setReviewStatus(c.id, "APPROVED");
      } catch (e: any) {
        alert(e.message || "Failed to approve");
      }
    });
  };

  const handleReject = () => {
    startReject(async () => {
      try {
        await setReviewStatus(c.id, "REJECTED");
      } catch (e: any) {
        alert(e.message || "Failed to reject");
      }
    });
  };

  const handleExtract = () => {
    startExtract(async () => {
      try {
        await extractCase(c.id);
      } catch (e: any) {
        alert(e.message || "Failed to extract");
      }
    });
  };

  const extractLabel = isPendingExtract 
    ? "Extracting..." 
    : c.extractionStatus === 'FAILED' 
      ? 'Retry Extract' 
      : c.extractionStatus === 'READY' 
        ? 'Re-extract (Reset)' 
        : 'Extract';

  return (
    <tr className="[&:last-child_td]:border-b-0 hover:bg-[var(--ground)]">
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

          {c.extractionStatus === 'READY' && (
            <details className="mt-[10px] bg-[var(--ground)] border border-[var(--line-soft)] rounded-[6px] p-[10px] text-[12px] group">
              <summary className="font-bold cursor-pointer outline-none select-none text-[var(--accent)] group-open:mb-[10px]">
                View Extracted AI Data {c.confidence ? `(${c.confidence}% confident)` : ''}
              </summary>
              <div className="flex flex-col gap-[8px] text-[var(--ink-2)]">
                <div><strong className="text-[var(--ink)]">Issue Summary:</strong> {c.issueText || "N/A"}</div>
                <div><strong className="text-[var(--ink)]">Symptoms:</strong> {c.symptoms || "N/A"}</div>
                <div><strong className="text-[var(--ink)]">Troubleshooting:</strong> {c.troubleshooting || "N/A"}</div>
                <div><strong className="text-[var(--ink)]">Resolution:</strong> {c.resolutionText || "N/A"}</div>
                <div className="flex gap-[10px] text-[11px] mt-[4px] font-mono">
                  {c.topic && <span>Topic: {c.topic}</span>}
                  {c.usableAsHistoricalCase !== null && (
                    <span className={c.usableAsHistoricalCase ? '' : 'text-[var(--warn)] font-bold'}>
                      Usable: {c.usableAsHistoricalCase ? 'Yes' : 'No'}
                    </span>
                  )}
                </div>
              </div>
            </details>
          )}
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
              c.extractionStatus === 'PROCESSING' || isPendingExtract ? 'bg-[var(--warn-soft)] text-[var(--warn)]' :
              'bg-[var(--surface-2)] text-[var(--ink-2)]'
            }`}>
              {isPendingExtract ? 'PROCESSING' : c.extractionStatus}
            </span>
          </div>
          <div className="flex items-center gap-[6px]">
            <span className="text-[10px] uppercase tracking-widest text-[var(--ink-3)]">Review:</span>
            <span className={`font-display font-bold text-[9px] tracking-[0.1em] uppercase rounded-[4px] px-[6px] py-[2px] ${
              c.reviewStatus === 'APPROVED' && !isPendingApprove && !isPendingReject ? 'bg-[var(--ok-soft)] text-[var(--ok)]' : 
              c.reviewStatus === 'REJECTED' && !isPendingApprove && !isPendingReject ? 'bg-[var(--warn-soft)] text-[var(--warn)]' : 
              'bg-[var(--surface-2)] text-[var(--ink-2)]'
            }`}>
              {c.reviewStatus}
            </span>
          </div>
        </div>
      </td>
      <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
        <div className="flex flex-col gap-[6px]">
          <div className="flex gap-[6px]">
            <button 
              onClick={handleApprove}
              disabled={isGlobalPending || c.reviewStatus === 'APPROVED' || c.extractionStatus !== 'READY'} 
              className="text-[11px] font-bold px-[8px] py-[4px] rounded-[4px] bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--ok)] hover:text-[var(--ok)] disabled:opacity-50 cursor-pointer min-w-[70px] flex justify-center"
            >
              {isPendingApprove ? "Approving..." : "Approve"}
            </button>

            <button 
              onClick={handleReject}
              disabled={isGlobalPending || c.reviewStatus === 'REJECTED' || c.extractionStatus !== 'READY'} 
              className="text-[11px] font-bold px-[8px] py-[4px] rounded-[4px] bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--warn)] hover:text-[var(--warn)] disabled:opacity-50 cursor-pointer min-w-[70px] flex justify-center"
            >
              {isPendingReject ? "Rejecting..." : "Reject"}
            </button>
          </div>
          
          <button 
            onClick={handleExtract}
            disabled={isGlobalPending || c.extractionStatus === 'PROCESSING'} 
            className="w-full text-center text-[11px] font-bold px-[8px] py-[4px] rounded-[4px] bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50 cursor-pointer flex justify-center gap-[6px] items-center"
          >
            {isPendingExtract && (
              <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {extractLabel}
          </button>
        </div>
      </td>
    </tr>
  );
}
