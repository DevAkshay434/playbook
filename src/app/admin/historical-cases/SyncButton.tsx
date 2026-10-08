"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cron/sync-richpanel?manual=1", { method: "POST" });
      if (!res.ok) {
        alert("Sync failed");
      }
    } catch (err) {
      alert("Error occurred");
    } finally {
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <button 
      onClick={handleSync} 
      disabled={loading}
      className="bg-[var(--navy)] text-white text-[13px] font-bold p-[9px_15px] rounded-[4px] hover:bg-[var(--accent)] disabled:opacity-50"
    >
      {loading ? "Syncing (10 max)..." : "Sync Richpanel Cases"}
    </button>
  );
}
