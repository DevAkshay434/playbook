"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSync = async () => {
    // Note: useTransition wraps the state updates including the router.refresh()
    startTransition(async () => {
      try {
        const res = await fetch("/api/cron/sync-richpanel?manual=1", { method: "POST" });
        if (!res.ok) {
          alert("Sync failed");
        }
      } catch (err) {
        alert("Error occurred");
      } finally {
        router.refresh();
      }
    });
  };

  return (
    <button 
      onClick={handleSync} 
      disabled={isPending}
      className="bg-[var(--navy)] flex items-center justify-center gap-[6px] text-[var(--ground)] text-[13px] font-bold p-[9px_15px] rounded-[4px] hover:bg-[var(--accent)] disabled:opacity-50 min-w-[175px]"
    >
      {isPending ? (
        <>
          <svg className="animate-spin h-3 w-3 text-[var(--ground)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Syncing Richpanel...
        </>
      ) : (
        "Sync Richpanel Cases"
      )}
    </button>
  );
}
