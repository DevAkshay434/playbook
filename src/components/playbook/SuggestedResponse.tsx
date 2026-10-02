"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SuggestedResponseProps {
  text: string;
}

export default function SuggestedResponse({ text }: SuggestedResponseProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-[var(--ground)] border border-[var(--line-soft)] rounded-[6px] p-[13px_14px] flex flex-col gap-[9px]">
      <p className="text-[14px] text-[var(--ink)] leading-[1.6]">
        {text}
      </p>
      <div className="flex justify-end items-center gap-[10px]">
        <button
          onClick={handleCopy}
          type="button"
          className={cn(
            "border border-[var(--line)] bg-[var(--surface)] font-display font-semibold text-[10px] tracking-[0.08em] uppercase rounded-[5px] px-[9px] py-[4px] cursor-pointer flex-none transition-colors",
            copied ? "text-[var(--ok)] border-[var(--ok)]" : "text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          )}
        >
          {copied ? "Copied" : "Copy Response"}
        </button>
      </div>
    </div>
  );
}
