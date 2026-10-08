import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AnalyticsPage() {
  // Execute independent queries concurrently
  const [
    totalSearches,
    searchesWithResults,
    zeroResultSearches,
    popularQueriesRaw,
    zeroResultQueriesRaw,
    playbooks,
    pendingResolutions
  ] = await Promise.all([
    prisma.searchEvent.count(),
    prisma.searchEvent.count({ where: { resultCount: { gt: 0 } } }),
    prisma.searchEvent.count({ where: { resultCount: 0 } }),
    prisma.searchEvent.groupBy({
      by: ["normalizedQuery"],
      where: { normalizedQuery: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 15,
    }),
    prisma.searchEvent.groupBy({
      by: ["normalizedQuery"],
      where: { resultCount: 0, normalizedQuery: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    }),
    prisma.playbook.findMany({
      where: { active: true },
      select: { id: true, slug: true, title: true, lastConfirmed: true },
      orderBy: { title: "asc" },
    }),
    prisma.resolution.count({ where: { status: "PENDING" } })
  ]);

  const zeroResultRate = totalSearches > 0 ? ((zeroResultSearches / totalSearches) * 100).toFixed(1) : "0";

  const popularQueries: { normalizedQuery: string; _count: { id: number } }[] = popularQueriesRaw as any;
  const zeroResultQueries: { normalizedQuery: string; _count: { id: number } }[] = zeroResultQueriesRaw as any;

  // Stale SOP Report
  const now = new Date();
  const staleBuckets = { fresh: [] as typeof playbooks, aging: [] as typeof playbooks, stale: [] as typeof playbooks, never: [] as typeof playbooks };

  for (const pb of playbooks) {
    if (!pb.lastConfirmed) {
      staleBuckets.never.push(pb);
      continue;
    }
    const confirmedDate = new Date(pb.lastConfirmed);
    const daysSince = Math.floor((now.getTime() - confirmedDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 90) staleBuckets.fresh.push(pb);
    else if (daysSince <= 180) staleBuckets.aging.push(pb);
    else staleBuckets.stale.push(pb);
  }

  return (
    <div className="flex flex-col gap-[30px]">
      <div className="flex flex-col gap-[3px] mb-[10px]">
        <h2 className="text-[26px] font-bold tracking-[-0.015em]">Analytics</h2>
        <p className="text-[var(--ink-2)] text-[13.5px]">Search activity, coverage gaps, and content freshness.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-[12px]">
        <MetricCard label="Total Searches" value={totalSearches} />
        <MetricCard label="With Results" value={searchesWithResults} color="ok" />
        <MetricCard label="Zero Results" value={zeroResultSearches} color="stop" />
        <MetricCard label="Zero-Result Rate" value={`${zeroResultRate}%`} color={Number(zeroResultRate) > 20 ? "stop" : "ink-3"} />
        <Link href="/admin/resolutions" className="no-underline">
          <MetricCard label="Pending Resolutions" value={pendingResolutions} color="warn" />
        </Link>
      </div>

      {/* Missing Playbook Coverage */}
      <section className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px]">
        <h3 className="font-display font-bold text-[12px] tracking-[0.08em] uppercase text-[var(--stop)] mb-[12px]">Missing Playbook Coverage</h3>
        <p className="text-[12px] text-[var(--ink-2)] mb-[10px]">Searches that returned zero results - potential gaps in SOP coverage.</p>
        {zeroResultQueries.length === 0 ? (
          <p className="text-[13px] text-[var(--ink-3)]">No zero-result searches recorded yet.</p>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="text-left p-[8px_12px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Query</th>
                <th className="text-right p-[8px_12px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)] w-[80px]">Searches</th>
              </tr>
            </thead>
            <tbody>
              {zeroResultQueries.map((q) => (
                <tr key={q.normalizedQuery} className="[&:last-child_td]:border-b-0">
                  <td className="p-[8px_12px] border-b border-[var(--line-soft)] font-mono text-[12px]">{q.normalizedQuery}</td>
                  <td className="p-[8px_12px] border-b border-[var(--line-soft)] text-right font-bold">{q._count.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Popular Queries */}
      <section className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px]">
        <h3 className="font-display font-bold text-[12px] tracking-[0.08em] uppercase text-[var(--ink)] mb-[12px]">Popular Search Queries</h3>
        {popularQueries.length === 0 ? (
          <p className="text-[13px] text-[var(--ink-3)]">No search data recorded yet.</p>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="text-left p-[8px_12px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Query</th>
                <th className="text-right p-[8px_12px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)] w-[80px]">Count</th>
              </tr>
            </thead>
            <tbody>
              {popularQueries.map((q) => (
                <tr key={q.normalizedQuery} className="[&:last-child_td]:border-b-0">
                  <td className="p-[8px_12px] border-b border-[var(--line-soft)] font-mono text-[12px]">{q.normalizedQuery}</td>
                  <td className="p-[8px_12px] border-b border-[var(--line-soft)] text-right font-bold">{q._count.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Stale SOP Report */}
      <section className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px]">
        <h3 className="font-display font-bold text-[12px] tracking-[0.08em] uppercase text-[var(--ink)] mb-[12px]">SOP Freshness Report</h3>
        <p className="text-[12px] text-[var(--ink-2)] mb-[12px]">Based on the <code className="font-mono text-[11px] bg-[var(--ground)] px-1">lastConfirmed</code> date on each Playbook.</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[10px] mb-[15px]">
          <div className="flex flex-col bg-[var(--ok-soft)] border border-[var(--ok)] rounded-[6px] p-[12px]">
            <span className="font-display font-bold text-[10px] uppercase text-[var(--ok)] tracking-[0.1em]">Fresh (&le; 90 days)</span>
            <span className="text-[22px] font-bold">{staleBuckets.fresh.length}</span>
          </div>
          <div className="flex flex-col bg-[var(--warn-soft,#fff8e1)] border border-[var(--warn)] rounded-[6px] p-[12px]">
            <span className="font-display font-bold text-[10px] uppercase text-[var(--warn)] tracking-[0.1em]">Aging (91-180 days)</span>
            <span className="text-[22px] font-bold">{staleBuckets.aging.length}</span>
          </div>
          <div className="flex flex-col bg-[var(--stop-soft)] border border-[var(--stop)] rounded-[6px] p-[12px]">
            <span className="font-display font-bold text-[10px] uppercase text-[var(--stop)] tracking-[0.1em]">Stale (&gt; 180 days)</span>
            <span className="text-[22px] font-bold">{staleBuckets.stale.length}</span>
          </div>
          <div className="flex flex-col bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[12px]">
            <span className="font-display font-bold text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em]">Never Confirmed</span>
            <span className="text-[22px] font-bold">{staleBuckets.never.length}</span>
          </div>
        </div>
        {(staleBuckets.stale.length > 0 || staleBuckets.never.length > 0) && (
          <div className="flex flex-col gap-[4px]">
            <span className="font-display font-bold text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em] mb-[4px]">Needs Review</span>
            {[...staleBuckets.stale, ...staleBuckets.never].map(pb => (
              <Link key={pb.id} href={`/admin/playbooks/${pb.slug}`} className="text-[13px] text-[var(--accent)] hover:underline no-underline">
                {pb.title} <span className="text-[var(--ink-3)] font-mono text-[11px]">{pb.lastConfirmed || "never confirmed"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  const colorClass = color === "ok" ? "text-[var(--ok)]" : color === "warn" ? "text-[var(--warn)]" : color === "stop" ? "text-[var(--stop)]" : "text-[var(--ink-3)]";
  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[16px] flex flex-col gap-[5px]">
      <span className={`font-display font-semibold text-[10px] tracking-[0.16em] uppercase ${colorClass}`}>{label}</span>
      <span className="text-[28px] font-bold tracking-[-0.02em]">{value}</span>
    </div>
  );
}
