"use client";

import { useTransition } from "react";
import { extractNext5 } from "./actions";

export default function ExtractNextButton() {
  const [isPending, startTransition] = useTransition();

  const handleExtract = () => {
    startTransition(async () => {
      try {
        await extractNext5();
      } catch (err: any) {
        alert(err.message || "Failed to extract next 5");
      }
    });
  };

  return (
    <button 
      onClick={handleExtract}
      disabled={isPending}
      className="bg-[var(--surface-2)] flex items-center justify-center gap-[6px] text-[var(--ink)] border border-[var(--line)] text-[13px] font-bold p-[9px_15px] rounded-[4px] hover:bg-[var(--line)] disabled:opacity-50 cursor-pointer min-w-[130px]"
    >
      {isPending ? (
        <>
          <svg className="animate-spin h-3 w-3 text-[var(--ink)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Extracting Cases...
        </>
      ) : (
        "Extract Next 5"
      )}
    </button>
  );
}
