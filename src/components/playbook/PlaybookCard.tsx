"use client";

import { Playbook } from "@/types/playbook";
import { cn } from "@/lib/utils";
import AuthorityBadge from "./AuthorityBadge";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import PlaybookDetail from "./PlaybookDetail";

interface PlaybookCardProps {
  playbook: Playbook;
}

export default function PlaybookCard({ playbook }: PlaybookCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn(
      "bg-[var(--surface)] border border-[var(--line)] border-l-[3px] rounded-[var(--radius)] overflow-hidden",
      playbook.authority === "resolve" ? "border-l-[var(--ok)]" :
      playbook.authority === "judge" ? "border-l-[var(--warn)]" :
      playbook.authority === "escalate" ? "border-l-[var(--stop)]" : "border-l-[var(--line)]"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-transparent border-0 text-left cursor-pointer p-[14px_16px] flex gap-[13px] items-start hover:bg-[var(--surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[-2px] transition-colors"
      >
        <ChevronRight
          className={cn(
            "shrink-0 mt-1 w-4 h-4 text-[var(--ink-3)] transition-transform duration-150",
            isOpen && "rotate-90"
          )}
        />
        <div className="flex flex-col gap-[5px] min-w-0 flex-1">
          <h3 className="text-[15.5px] font-semibold tracking-[-0.005em] leading-[1.35] text-[var(--ink)]">
            {playbook.title}
          </h3>
          {playbook.customerPhrases.length > 0 && (
            <span className="text-[12.5px] text-[var(--ink-3)] italic">
              {playbook.customerPhrases.join(" · ")}
            </span>
          )}
        </div>
        <div className="flex gap-[6px] flex-wrap items-center shrink-0 pt-[1px]">
          {playbook.knownGap && (
            <span className="font-display font-bold text-[9.5px] tracking-[0.1em] uppercase rounded-[4px] px-[7px] py-[3px] whitespace-nowrap bg-[var(--surface-2)] text-[var(--ink-3)]">
              Gap
            </span>
          )}
          <AuthorityBadge level={playbook.authority} />
        </div>
      </button>

      {isOpen && (
        <div className="p-[2px_16px_18px_16px] flex flex-col gap-[15px] border-t border-[var(--line-soft)] pt-[16px]">
          <PlaybookDetail playbook={playbook} />
        </div>
      )}
    </div>
  );
}
