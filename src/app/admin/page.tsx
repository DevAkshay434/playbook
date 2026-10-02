import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-services";
import { playbooks as fallbackPlaybooks } from "@/data/playbooks";

export default async function AdminDashboard() {
  let activePlaybooks = fallbackPlaybooks.length;
  let pendingResolutions = 0;
  let zeroResultSearches = 0;
  let activeAgents = 1;

  if (isDbConnected) {
    activePlaybooks = await prisma.playbook.count({ where: { active: true } });
    pendingResolutions = await prisma.resolution.count({ where: { status: "PENDING" } });
    zeroResultSearches = await prisma.searchEvent.count({ where: { resultCount: 0 } });
    activeAgents = await prisma.user.count({ where: { active: true, role: "AGENT" } });
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[3px] mb-[10px]">
        <h2 className="text-[26px] font-bold tracking-[-0.015em]">Dashboard Overview</h2>
        <p className="text-[var(--ink-2)] text-[13.5px]">SoftPro Support internal metrics.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[12px]">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px] flex flex-col gap-[6px]">
          <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)]">Active Playbooks</span>
          <span className="text-[32px] font-bold tracking-[-0.02em]">{activePlaybooks}</span>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px] flex flex-col gap-[6px]">
          <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--warn)]">Pending Resolutions</span>
          <span className="text-[32px] font-bold tracking-[-0.02em]">{pendingResolutions}</span>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px] flex flex-col gap-[6px]">
          <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--stop)]">Zero-Result Searches</span>
          <span className="text-[32px] font-bold tracking-[-0.02em]">{zeroResultSearches}</span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px] flex flex-col gap-[6px]">
          <span className="font-display font-semibold text-[10px] tracking-[0.16em] uppercase text-[var(--ink-3)]">Active Agents</span>
          <span className="text-[32px] font-bold tracking-[-0.02em]">{activeAgents}</span>
        </div>
      </div>
    </div>
  );
}
