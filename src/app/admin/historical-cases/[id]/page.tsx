import { requireActiveDbUser } from "@/lib/server-auth";
import { isManager } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ExtractNextButton from "../ExtractNextButton";

export default async function HistoricalCaseDetailPage({ params }: { params: { id: string } }) {
  const { dbUser } = await requireActiveDbUser();
  if (!isManager(dbUser.role)) {
    redirect("/admin");
  }

  const supportCase = await prisma.historicalSupportCase.findUnique({
    where: { id: params.id }
  });

  if (!supportCase) {
    return <div className="p-4">Case not found.</div>;
  }

  const tags = Array.isArray(supportCase.tags) ? supportCase.tags as string[] : [];

  return (
    <div className="flex flex-col gap-[20px] pb-[40px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-[10px] border-b border-[var(--line)] pb-[15px]">
        <div className="flex flex-col gap-[3px]">
          <div className="flex items-center gap-[10px] mb-[5px]">
            <Link href="/admin/historical-cases" className="text-[12px] font-bold text-[var(--ink-3)] hover:text-[var(--ink)] flex items-center gap-[4px] no-underline">
              ← Back to Cases
            </Link>
          </div>
          <h2 className="text-[26px] font-bold tracking-[-0.015em] flex items-center gap-[10px]">
            Case: {supportCase.externalNumber || supportCase.externalId}
          </h2>
          <p className="text-[var(--ink-2)] text-[13.5px] max-w-[600px]">{supportCase.subject || "No Subject"}</p>
        </div>
        
        <div className="flex flex-col items-end gap-[5px]">
          <span className={`text-[11px] font-display font-bold uppercase tracking-wider px-[6px] py-[3px] rounded-[3px] ${
            supportCase.extractionStatus === "READY" ? "bg-[var(--ok-soft)] text-[var(--ok)]" :
            supportCase.extractionStatus === "FAILED" ? "bg-[var(--stop-soft)] text-[var(--stop)]" :
            "bg-[var(--line)] text-[var(--ink-3)]"
          }`}>
            Extraction: {supportCase.extractionStatus}
          </span>
          <span className={`text-[11px] font-display font-bold uppercase tracking-wider px-[6px] py-[3px] rounded-[3px] ${
            supportCase.reviewStatus === "APPROVED" ? "bg-[var(--ok-soft)] text-[var(--ok)]" :
            supportCase.reviewStatus === "REJECTED" ? "bg-[var(--stop-soft)] text-[var(--stop)]" :
            "bg-[var(--warn-soft)] text-[var(--warn)]"
          }`}>
            Review: {supportCase.reviewStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
        
        {/* Source Metadata */}
        <div className="bg-[var(--surface)] border border-[var(--line)] p-[20px] rounded-[var(--radius)] flex flex-col gap-[15px]">
          <h3 className="font-display font-bold text-[12px] tracking-[0.08em] uppercase text-[var(--ink)]">Source Metadata</h3>
          
          <div className="flex flex-col gap-[4px]">
            <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--ink-3)]">Source</span>
            <span className="text-[14px]">{supportCase.source}</span>
          </div>

          <div className="flex flex-col gap-[4px]">
            <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--ink-3)]">Original URL</span>
            {supportCase.sourceUrl ? (
              <a href={supportCase.sourceUrl} target="_blank" rel="noreferrer" className="text-[14px] text-[var(--accent)] underline">View Original</a>
            ) : (
              <span className="text-[14px] text-[var(--ink-3)]">N/A</span>
            )}
          </div>

          <div className="flex flex-col gap-[4px]">
            <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--ink-3)]">Timeline</span>
            <span className="text-[13px]"><strong className="text-[var(--ink)]">Opened:</strong> {supportCase.openedAt ? supportCase.openedAt.toLocaleString() : "N/A"}</span>
            <span className="text-[13px]"><strong className="text-[var(--ink)]">Resolved:</strong> {supportCase.resolvedAt ? supportCase.resolvedAt.toLocaleString() : "N/A"}</span>
            <span className="text-[13px]"><strong className="text-[var(--ink)]">Last Updated:</strong> {supportCase.sourceUpdatedAt ? supportCase.sourceUpdatedAt.toLocaleString() : "N/A"}</span>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-col gap-[8px]">
              <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--ink-3)]">Tags</span>
              <div className="flex flex-wrap gap-[6px]">
                {tags.map((t, i) => (
                  <span key={i} className="text-[11px] bg-[var(--line)] px-[6px] py-[2px] rounded-[4px]">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Extraction Data */}
        <div className="bg-[var(--surface)] border border-[var(--line)] p-[20px] rounded-[var(--radius)] flex flex-col gap-[15px]">
          <h3 className="font-display font-bold text-[12px] tracking-[0.08em] uppercase text-[var(--ink)] flex justify-between items-center">
            Extracted Knowledge
            {supportCase.extractionStatus === "READY" && (
              <span className="text-[10px] bg-[var(--line)] px-[6px] py-[2px] rounded-[4px]">Conf: {supportCase.confidence}%</span>
            )}
          </h3>

          {!supportCase.issueText ? (
            <p className="text-[13px] text-[var(--ink-3)] italic">No extracted knowledge available.</p>
          ) : (
            <>
              <div className="flex flex-col gap-[6px]">
                <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--ink-3)]">Issue / Summary</span>
                <p className="text-[13.5px] leading-relaxed m-0 whitespace-pre-wrap">{supportCase.issueText}</p>
              </div>
              <div className="flex flex-col gap-[6px]">
                <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--ink-3)]">Symptoms</span>
                <p className="text-[13.5px] leading-relaxed m-0 whitespace-pre-wrap">{supportCase.symptoms || "None"}</p>
              </div>
              <div className="flex flex-col gap-[6px]">
                <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--ink-3)]">Troubleshooting</span>
                <p className="text-[13.5px] leading-relaxed m-0 whitespace-pre-wrap">{supportCase.troubleshooting || "None"}</p>
              </div>
              <div className="flex flex-col gap-[6px]">
                <span className="text-[10px] uppercase font-display font-bold tracking-[0.1em] text-[var(--ink-3)]">Resolution</span>
                <p className="text-[13.5px] leading-relaxed m-0 whitespace-pre-wrap font-semibold text-[var(--ink)] bg-[var(--line-soft)] p-[10px] rounded-[6px]">{supportCase.resolutionText}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
