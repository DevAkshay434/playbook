import { prisma } from "@/lib/prisma";
import KBSyncButton from "./KBSyncButton";

export default async function KnowledgeBaseAdminPage() {
  const [articles, lastSuccessfulSync, lastFailedSync, recentSyncs] = await Promise.all([
    prisma.knowledgeBaseArticle.findMany({
      orderBy: { title: "asc" }
    }),
    prisma.knowledgeBaseSyncRun.findFirst({
      where: { status: "SUCCESS" },
      orderBy: { completedAt: "desc" },
    }),
    prisma.knowledgeBaseSyncRun.findFirst({
      where: { status: "FAILED" },
      orderBy: { completedAt: "desc" },
    }),
    prisma.knowledgeBaseSyncRun.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
    })
  ]);

  const activeCount = articles.filter(a => a.active).length;

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[3px] mb-[10px]">
        <h2 className="text-[26px] font-bold tracking-[-0.015em]">Knowledge Base</h2>
        <p className="text-[var(--ink-2)] text-[13.5px]">Manage WordPress KB Indexing.</p>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px] flex flex-col gap-[15px]">
        <h3 className="font-display font-bold text-[14px] uppercase tracking-[0.05em] text-[var(--ink)]">Synchronization</h3>
        <p className="text-[13.5px] text-[var(--ink-2)] m-0 max-w-[600px]">
          The Playbook maintains a search index of published WordPress articles. Syncing fetches the latest pages from <code className="font-mono bg-[var(--ground)] px-1">kb.softprowatersystems.com</code>. A daily automatic sync runs at 06:00 UTC via Vercel Cron.
        </p>

        <div className="flex gap-[20px] mb-[10px] flex-wrap">
          <div className="flex flex-col">
            <span className="font-display font-bold text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em]">Active Articles</span>
            <span className="font-bold text-[18px]">{activeCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em]">Total Indexed</span>
            <span className="font-bold text-[18px]">{articles.length}</span>
          </div>
          {lastSuccessfulSync && (
            <>
              <div className="flex flex-col">
                <span className="font-display font-bold text-[10px] uppercase text-[var(--ok)] tracking-[0.1em]">Last Successful Sync</span>
                <span className="font-mono text-[13px]">{new Date(lastSuccessfulSync.completedAt!).toLocaleString()}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-[10px] uppercase text-[var(--ink-3)] tracking-[0.1em]">Source</span>
                <span className="font-mono text-[13px]">{lastSuccessfulSync.triggeredBy}</span>
              </div>
            </>
          )}
        </div>

        {lastFailedSync && lastFailedSync.completedAt && lastSuccessfulSync?.completedAt &&
          lastFailedSync.completedAt > lastSuccessfulSync.completedAt && (
          <div className="bg-[var(--stop-soft)] border border-[var(--stop)] rounded-[6px] p-[10px] text-[13px]">
            <strong className="text-[var(--stop)]">Last sync failed</strong> at {new Date(lastFailedSync.completedAt).toLocaleString()}
          </div>
        )}
        
        <KBSyncButton />
      </div>

      {/* Sync History */}
      {recentSyncs.length > 0 && (
        <div className="overflow-x-auto border border-[var(--line)] rounded-[var(--radius)] bg-[var(--surface)]">
          <h3 className="font-display font-bold text-[12px] tracking-[0.08em] uppercase text-[var(--ink)] p-[14px] pb-0">Recent Sync Runs</h3>
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Time</th>
                <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Trigger</th>
                <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Status</th>
                <th className="text-right p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Added</th>
                <th className="text-right p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Updated</th>
                <th className="text-right p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Deactivated</th>
              </tr>
            </thead>
            <tbody>
              {recentSyncs.map(s => (
                <tr key={s.id} className="[&:last-child_td]:border-b-0">
                  <td className="p-[8px_14px] border-b border-[var(--line-soft)] font-mono text-[11px]">{new Date(s.startedAt).toLocaleString()}</td>
                  <td className="p-[8px_14px] border-b border-[var(--line-soft)]">
                    <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase bg-[var(--line)] px-[5px] py-[2px] rounded-[3px]">{s.triggeredBy}</span>
                  </td>
                  <td className="p-[8px_14px] border-b border-[var(--line-soft)]">
                    <span className={`font-display font-bold text-[9px] tracking-[0.1em] uppercase px-[5px] py-[2px] rounded-[3px] ${s.status === "SUCCESS" ? "bg-[var(--ok-soft)] text-[var(--ok)]" : s.status === "FAILED" ? "bg-[var(--stop-soft)] text-[var(--stop)]" : "bg-[var(--line)] text-[var(--ink-3)]"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-[8px_14px] border-b border-[var(--line-soft)] text-right font-mono text-[12px]">{s.addedCount}</td>
                  <td className="p-[8px_14px] border-b border-[var(--line-soft)] text-right font-mono text-[12px]">{s.updatedCount}</td>
                  <td className="p-[8px_14px] border-b border-[var(--line-soft)] text-right font-mono text-[12px]">{s.deactivatedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Article Index */}
      <div className="overflow-x-auto border border-[var(--line)] rounded-[var(--radius)] bg-[var(--surface)] mt-[10px]">
        <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
          <thead>
            <tr>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Title</th>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">WP Modified</th>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Last Indexed</th>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Link</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-[20px] text-[var(--ink-3)]">No articles indexed yet.</td>
              </tr>
            )}
            {articles.map((a) => (
              <tr key={a.id} className={`[&:last-child_td]:border-b-0 ${!a.active ? 'opacity-50' : ''}`}>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] font-semibold flex items-center gap-[6px]">
                  {a.title}
                  {!a.active && <span className="text-[9px] bg-[var(--line)] px-[4px] py-[2px] rounded-[3px] uppercase tracking-widest font-display">Inactive</span>}
                </td>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] font-mono text-[11px] text-[var(--ink-3)]">
                  {new Date(a.wordpressModifiedAt).toLocaleDateString()}
                </td>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] font-mono text-[11px] text-[var(--ink-3)]">
                  {new Date(a.indexedAt).toLocaleString()}
                </td>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)]">
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline font-mono text-[12px]">View Original</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
