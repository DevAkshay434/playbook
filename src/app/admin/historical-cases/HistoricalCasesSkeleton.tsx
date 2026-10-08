"use client";

export default function HistoricalCasesSkeleton() {
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
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i} className="[&:last-child_td]:border-b-0">
            <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
              <div className="flex flex-col gap-[8px] animate-pulse">
                <div className="h-[12px] w-[60px] bg-[var(--line)] rounded-[2px]"></div>
                <div className="h-[14px] w-[80px] bg-[var(--surface-2)] rounded-[2px]"></div>
              </div>
            </td>
            <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top w-[40%]">
              <div className="flex flex-col gap-[8px] animate-pulse">
                <div className="h-[16px] w-[80%] bg-[var(--line)] rounded-[2px]"></div>
                <div className="h-[14px] w-[60%] bg-[var(--surface-2)] rounded-[2px]"></div>
                <div className="flex gap-[4px] mt-[4px]">
                  <div className="h-[14px] w-[40px] bg-[var(--line-soft)] rounded-[4px]"></div>
                  <div className="h-[14px] w-[50px] bg-[var(--line-soft)] rounded-[4px]"></div>
                </div>
              </div>
            </td>
            <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
              <div className="h-[14px] w-[70px] bg-[var(--surface-2)] rounded-[2px] animate-pulse"></div>
            </td>
            <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
              <div className="flex flex-col gap-[8px] animate-pulse">
                <div className="h-[14px] w-[90px] bg-[var(--line)] rounded-[2px]"></div>
                <div className="h-[14px] w-[80px] bg-[var(--line)] rounded-[2px]"></div>
              </div>
            </td>
            <td className="text-left p-[10px_14px] border-b border-[var(--line-soft)] align-top">
              <div className="flex flex-col gap-[8px] animate-pulse">
                <div className="flex gap-[6px]">
                  <div className="h-[24px] w-[60px] bg-[var(--line)] rounded-[4px]"></div>
                  <div className="h-[24px] w-[60px] bg-[var(--line)] rounded-[4px]"></div>
                </div>
                <div className="h-[24px] w-full bg-[var(--surface-2)] rounded-[4px]"></div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
