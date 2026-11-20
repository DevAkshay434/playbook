import React from "react";
import { Playbook } from "@/types/playbook";
import SuggestedResponse from "./SuggestedResponse";
import Link from "next/link";

interface PlaybookDetailProps {
  playbook: Playbook;
}

function renderFormatted(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[var(--ink)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function PlaybookDetail({ playbook }: PlaybookDetailProps) {
  const suggestedResponse =
    playbook.suggestedResponse || (playbook as any).whatToSay;
  const dontDo = playbook.dontDo || (playbook as any).avoid;
  const verifiedDate =
    playbook.lastConfirmed || (playbook as any).verifiedDate;

  return (
    <div className="flex flex-col gap-[15px]">
      {playbook.facts && playbook.facts.length > 0 && (
        <div className="flex flex-col gap-[6px]">
          <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">
            Facts
          </h4>
          <ul className="m-0 pl-[17px] flex flex-col gap-[5px] list-disc">
            {playbook.facts.map((fact, idx) => (
              <li key={idx} className="text-[14px] text-[var(--ink-2)]">
                {renderFormatted(fact)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {playbook.troubleshootingSteps &&
        playbook.troubleshootingSteps.length > 0 && (
          <div className="flex flex-col gap-[6px]">
            <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">
              Steps
            </h4>
            <ol
              className="list-none pl-0 gap-[8px] flex flex-col m-0"
              style={{ counterReset: "s" }}
            >
              {playbook.troubleshootingSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="relative pl-[28px] text-[14px] text-[var(--ink-2)]"
                  style={{ counterIncrement: "s" }}
                >
                  <span className="absolute left-0 top-[1px] w-[19px] h-[19px] rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[11px] grid place-items-center">
                    {idx + 1}
                  </span>
                  {renderFormatted(step)}
                </li>
              ))}
            </ol>
          </div>
        )}

      {suggestedResponse && (
        <div className="flex flex-col gap-[6px]">
          <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">
            Customer Response Script
          </h4>
          <SuggestedResponse text={suggestedResponse} />
        </div>
      )}

      {dontDo && dontDo.length > 0 && (
        <div className="flex flex-col gap-[6px]">
          <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--stop)]">
            Avoid
          </h4>
          <ul className="m-0 pl-[17px] flex flex-col gap-[5px] list-disc">
            {dontDo.map((item: string, idx: number) => (
              <li
                key={idx}
                className="text-[14px] text-[var(--ink-2)] marker:text-[var(--stop)]"
              >
                {renderFormatted(item)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-[14px] flex-wrap items-center border-t border-dashed border-[var(--line)] pt-[11px] font-mono text-[11px] text-[var(--ink-3)]">
        {playbook.source && (
          <span>
            <b className="font-medium text-[var(--ink-2)]">Source:</b>{" "}
            {playbook.source}
          </span>
        )}
        {verifiedDate && (
          <span>
            <b className="font-medium text-[var(--ink-2)]">Verified:</b>{" "}
            {verifiedDate}
          </span>
        )}
        <span>
          <Link
            href={`/playbook/${playbook.slug}`}
            className="text-[var(--accent)] hover:underline"
          >
            Direct Link
          </Link>
        </span>
      </div>
    </div>
  );
}
