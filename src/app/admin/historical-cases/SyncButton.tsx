"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton() {
  const [isPendingRp, startRp] = useTransition();
  const [isPendingGhl, startGhl] = useTransition();
  const router = useRouter();

  const handleSyncRp = () => {
    startRp(async () => {
      try {
        const res = await fetch("/api/cron/sync-richpanel?manual=1", { method: "POST" });
        if (!res.ok) {
          alert("Richpanel sync failed");
        }
      } catch {
        alert("Error occurred during Richpanel sync");
      } finally {
        router.refresh();
      }
    });
  };

  const handleSyncGhl = () => {
    startGhl(async () => {
      try {
        const res = await fetch("/api/cron/sync-ghl?manual=1", { method: "POST" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(data.error || "GHL sync failed");
        }
      } catch {
        alert("Error occurred during GHL sync");
      } finally {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-[8px]">
      <button 
        onClick={handleSyncRp} 
        disabled={isPendingRp || isPendingGhl}
        className="bg-[var(--navy)] flex items-center justify-center gap-[6px] text-[var(--ground)] text-[12px] font-bold p-[8px_12px] rounded-[4px] hover:bg-[var(--accent)] disabled:opacity-50"
      >
        {isPendingRp ? (
          <>
            <svg className="animate-spin h-3 w-3 text-[var(--ground)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Syncing Richpanel...
          </>
        ) : (
          "Sync Richpanel"
        )}
      </button>

      <button 
        onClick={handleSyncGhl} 
        disabled={isPendingRp || isPendingGhl}
        className="bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center gap-[6px] text-[var(--ink)] text-[12px] font-bold p-[8px_12px] rounded-[4px] hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
      >
        {isPendingGhl ? (
          <>
            <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Syncing GHL...
          </>
        ) : (
          "Sync GHL"
        )}
      </button>
    </div>
  );
}
