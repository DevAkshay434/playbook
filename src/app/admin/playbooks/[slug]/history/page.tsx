import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PlaybookHistoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playbook = await prisma.playbook.findUnique({ where: { slug } });
  
  if (!playbook) notFound();

  const versions = await prisma.playbookVersion.findMany({
    where: { playbookId: playbook.id },
    orderBy: { versionNumber: 'desc' },
    include: { changedBy: { select: { name: true, email: true } } }
  });

  return (
    <div className="flex flex-col gap-[20px] max-w-[800px]">
      <div className="flex flex-col gap-[3px] mb-[10px]">
        <h2 className="text-[26px] font-bold tracking-[-0.015em]">History: {playbook.title}</h2>
        <Link href="/admin/playbooks" className="text-[13px] text-[var(--accent)] hover:underline">
          &larr; Back to Playbooks
        </Link>
      </div>

      {versions.length === 0 ? (
        <div className="bg-[var(--surface)] border border-dashed border-[var(--line)] rounded-[var(--radius)] p-[30px] text-center text-[var(--ink-3)] text-[14px]">
          No recorded edits for this playbook.
        </div>
      ) : (
        <div className="flex flex-col gap-[15px]">
          {versions.map(v => (
            <div key={v.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px] flex flex-col gap-[8px]">
              <div className="flex justify-between items-center">
                <span className="font-display font-bold text-[13px] text-[var(--ink)] tracking-[0.02em]">Version {v.versionNumber}</span>
                <span className="font-mono text-[11px] text-[var(--ink-3)]">{new Date(v.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-[14px] text-[var(--ink-2)] m-0">Changed by: {v.changedBy.name || v.changedBy.email}</p>
              {v.changeNote && (
                <div className="bg-[var(--ground)] border border-[var(--line-soft)] rounded-[6px] p-[10px] mt-[5px]">
                  <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)] block mb-[4px]">Change Note</span>
                  <p className="text-[13px] m-0">{v.changeNote}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
