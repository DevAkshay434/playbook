import { Playbook } from "@/types/playbook";
import SuggestedResponse from "./SuggestedResponse";
import Link from "next/link";

interface PlaybookDetailProps {
  playbook: Playbook;
}

export default function PlaybookDetail({ playbook }: PlaybookDetailProps) {
  return (
    <>
      {playbook.facts && playbook.facts.length > 0 && (
        <div className="flex flex-col gap-[6px]">
          <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">
            Facts
          </h4>
          <ul className="m-0 pl-[17px] flex flex-col gap-[5px] list-disc">
            {playbook.facts.map((fact, idx) => (
              <li key={idx} className="text-[14px] text-[var(--ink-2)]">
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}

      {playbook.troubleshootingSteps && playbook.troubleshootingSteps.length > 0 && (
        <div className="flex flex-col gap-[6px]">
          <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">
            Steps
          </h4>
          <ol className="list-none pl-0 gap-[8px] flex flex-col m-0" style={{ counterReset: "s" }}>
            {playbook.troubleshootingSteps.map((step, idx) => (
              <li key={idx} className="relative pl-[28px] text-[14px] text-[var(--ink-2)]" style={{ counterIncrement: "s" }}>
                <span className="absolute left-0 top-[1px] w-[19px] h-[19px] rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[11px] grid place-items-center">
                  {idx + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {playbook.suggestedResponse && (
        <SuggestedResponse text={playbook.suggestedResponse} />
      )}

      {playbook.dontDo && playbook.dontDo.length > 0 && (
        <div className="flex flex-col gap-[6px]">
          <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">
            Avoid
          </h4>
          <ul className="m-0 pl-[17px] flex flex-col gap-[5px] list-disc">
            {playbook.dontDo.map((item, idx) => (
              <li key={idx} className="text-[14px] text-[var(--ink-2)] marker:text-[var(--stop)]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-[14px] flex-wrap items-center border-t border-dashed border-[var(--line)] pt-[11px] font-mono text-[11px] text-[var(--ink-3)]">
        {playbook.source && (
          <span>
            <b className="font-medium text-[var(--ink-2)]">Source:</b> {playbook.source}
          </span>
        )}
        {playbook.lastConfirmed && (
          <span>
            <b className="font-medium text-[var(--ink-2)]">Verified:</b> {playbook.lastConfirmed}
          </span>
        )}
        <span>
          <Link href={`/playbook/${playbook.slug}`} className="text-[var(--accent)] hover:underline">
            Direct Link
          </Link>
        </span>
      </div>
    </>
  );
}
