import { getPlaybooks } from "@/lib/db-services";
import Link from "next/link";

export default async function PlaybookAdminPage() {
  const playbooks = await getPlaybooks();

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[3px] mb-[10px]">
        <div className="flex justify-between items-center">
          <h2 className="text-[26px] font-bold tracking-[-0.015em]">Playbooks</h2>
          <Link href="/admin/playbooks/new" className="font-display font-bold text-[11px] tracking-[0.05em] uppercase bg-[var(--navy)] text-white rounded-[6px] px-[14px] py-[8px] no-underline hover:bg-[var(--accent)]">
            Create New
          </Link>
        </div>
        <p className="text-[var(--ink-2)] text-[13.5px]">Manage official SOPs.</p>
      </div>

      <div className="overflow-x-auto border border-[var(--line)] rounded-[var(--radius)] bg-[var(--surface)]">
        <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
          <thead>
            <tr>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Title</th>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Category</th>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Authority</th>
              <th className="text-left p-[10px_14px] border-b border-[var(--line)] font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)] bg-[var(--surface-2)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {playbooks.map((p) => (
              <tr key={p.id} className={`[&:last-child_td]:border-b-0 ${!(p as any).active ? 'opacity-50' : ''}`}>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] font-semibold flex items-center gap-[6px]">
                  {p.title}
                  {!(p as any).active && <span className="text-[9px] bg-[var(--line)] px-[4px] py-[2px] rounded-[3px] uppercase tracking-widest font-display">Archived</span>}
                </td>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)]">{(p as any).category?.name || (p as any).categoryId}</td>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] uppercase text-[10px] tracking-[0.05em] font-display">{p.authority}</td>
                <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] flex gap-[10px]">
                  <Link href={`/admin/playbooks/${p.slug}`} className="text-[var(--accent)] hover:underline font-mono text-[12px]">Edit</Link>
                  <Link href={`/admin/playbooks/${p.slug}/history`} className="text-[var(--ink-3)] hover:underline font-mono text-[12px]">History</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
