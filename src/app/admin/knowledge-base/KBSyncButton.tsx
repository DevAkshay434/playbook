"use client";
import { useTransition, useState } from "react";
import { triggerKBSync } from "@/app/actions/knowledge-base";

export default function KBSyncButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<any>(null);

  const handleSync = () => {
    startTransition(async () => {
      const res = await triggerKBSync();
      setResult(res);
    });
  };

  return (
    <div className="flex flex-col gap-[10px]">
      <button 
        onClick={handleSync} 
        disabled={isPending}
        className="self-start font-display font-bold text-[11px] tracking-[0.05em] uppercase bg-[var(--navy)] text-white rounded-[6px] px-[14px] py-[8px] cursor-pointer hover:bg-[var(--accent)] disabled:opacity-50 border-0"
      >
        {isPending ? "Syncing..." : "Sync WordPress KB"}
      </button>

      {result && (
        <div className={`p-[10px] rounded-[6px] text-[13px] border ${result.success ? 'bg-[var(--ok-soft)] text-[var(--ok)] border-[var(--ok)]' : 'bg-[var(--stop-soft)] text-[var(--stop)] border-[var(--stop)]'}`}>
          {result.success ? (
            <p className="m-0 font-mono">
              Sync complete. Fetched: {result.result.totalFetched}, Added: {result.result.added}, Updated: {result.result.updated}, Deactivated: {result.result.deactivated}.
            </p>
          ) : (
            <p className="m-0">Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
