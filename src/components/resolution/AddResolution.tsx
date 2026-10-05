"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { submitResolution } from "@/app/actions/resolution";

export default function AddResolution() {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const tmpl = `PLAYBOOK SUBMISSION\n\nProblem, in the customer's words:\nWhat's true (facts I confirmed):\nWhat I did, step by step:\nDollar amount involved, if any:\nHow it landed:\nOrder / ticket #:\nAnything the next agent should avoid:`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tmpl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await submitResolution(formData);
        if (result?.error) {
           setError(result.error);
        } else {
           setSubmitted(true);
           setTimeout(() => setSubmitted(false), 5000);
           (e.target as HTMLFormElement).reset();
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "We couldn't submit this resolution. Please try again.");
      }
    });
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px] flex flex-col gap-[14px]">
      <div className="flex flex-col gap-[6px]">
        <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">How to submit one</h4>
        <ol className="list-none pl-0 gap-[8px] flex flex-col m-0" style={{ counterReset: "s" }}>
          <li className="relative pl-[28px] text-[14px] text-[var(--ink-2)]" style={{ counterIncrement: "s" }}>
            <span className="absolute left-0 top-[1px] w-[19px] h-[19px] rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[11px] grid place-items-center">1</span>
            Open a ticket in Richpanel and tag it <strong>playbook</strong>.
          </li>
          <li className="relative pl-[28px] text-[14px] text-[var(--ink-2)]" style={{ counterIncrement: "s" }}>
            <span className="absolute left-0 top-[1px] w-[19px] h-[19px] rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[11px] grid place-items-center">2</span>
            Paste the template below and fill it in. Five minutes while it&apos;s fresh beats reconstructing it in a month.
          </li>
          <li className="relative pl-[28px] text-[14px] text-[var(--ink-2)]" style={{ counterIncrement: "s" }}>
            <span className="absolute left-0 top-[1px] w-[19px] h-[19px] rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[11px] grid place-items-center">3</span>
            Accepted submissions become standard entries here. You&apos;ll see yours show up.
          </li>
        </ol>
      </div>

      <div className="bg-[var(--ground)] border border-[var(--line-soft)] rounded-[6px] p-[13px_14px] flex flex-col gap-[9px]">
        <p className="whitespace-pre-line font-mono text-[12.5px] leading-[1.75] text-[var(--ink-2)]">
          {tmpl}
        </p>
        <div className="flex justify-between items-center gap-[10px]">
          <span className="font-mono text-[11.5px] text-[var(--ink-3)]">
            Paste this into a Richpanel ticket tagged <strong>playbook</strong>.
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "border border-[var(--line)] bg-[var(--surface)] font-display font-semibold text-[10px] tracking-[0.08em] uppercase rounded-[5px] px-[9px] py-[4px] cursor-pointer flex-none transition-colors",
              copied ? "text-[var(--ok)] border-[var(--ok)]" : "text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            )}
          >
            {copied ? "Copied" : "Copy template"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[6px]">
        <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">What happens to it</h4>
        <ul className="m-0 pl-[17px] flex flex-col gap-[5px] list-disc">
          <li className="text-[14px] text-[var(--ink-2)]">Submissions are reviewed, standardized into the same five-part format as every entry here, and given an authority level — so the next agent knows whether they can just do it.</li>
          <li className="text-[14px] text-[var(--ink-2)]">Separately, Richpanel and Consio exports get swept for recurring issues nobody wrote up. You&apos;re the fast path, not the only path.</li>
          <li className="text-[14px] text-[var(--ink-2)]">If an entry here is stale or wrong, submit that too. A playbook nobody corrects is one people quietly work around.</li>
        </ul>
      </div>

      <hr className="border-0 border-t border-[var(--line)] my-2" />
      
      {/* Structural preparation for Phase 2 API form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[14px]">
        <h4 className="font-display font-bold text-[10px] tracking-[0.13em] uppercase text-[var(--ink-3)]">Submit a Resolution</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Ticket Source</label>
            <select name="ticketSource" className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent">
              <option value="RICHPANEL">Richpanel</option>
              <option value="GHL">GoHighLevel</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Ticket ID</label>
            <input type="text" name="ticketId" placeholder="#12345" className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent" />
          </div>
        </div>

        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Customer Issue</label>
          <input required type="text" name="customerIssue" placeholder="What they said..." className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent" />
        </div>

        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Symptoms</label>
          <input required type="text" name="symptoms" placeholder="What was happening..." className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent" />
        </div>

        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Troubleshooting Performed</label>
          <textarea required name="troubleshootingPerformed" placeholder="Steps taken to diagnose..." className="min-h-[70px] resize-y font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent"></textarea>
        </div>

        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Final Resolution</label>
          <textarea required name="finalResolution" placeholder="What was done..." className="min-h-[70px] resize-y font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent"></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Refund/Credit Amount</label>
            <input type="text" name="refundCreditAmount" placeholder="$0.00" className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent" />
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Related Playbook / SOP</label>
            <input type="text" name="relatedPlaybookId" placeholder="e.g. meter-not-regenerating" className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent" />
          </div>
        </div>

        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">Notes for Future Agents</label>
          <textarea name="notesForFutureAgents" placeholder="Anything to watch out for..." className="min-h-[70px] resize-y font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent"></textarea>
        </div>

        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center gap-[15px]">
            <button type="submit" disabled={isPending} className="font-display font-bold text-[12px] tracking-[0.05em] bg-[var(--navy)] text-white border-0 rounded-[6px] p-[10px_18px] cursor-pointer hover:bg-[var(--accent)] transition-colors disabled:opacity-50">
              {isPending ? "Submitting..." : submitted ? "Submitted Successfully" : "Submit Resolution"}
            </button>
            {submitted && <span className="text-[13px] text-[var(--ok)] font-medium">Resolution submitted for review.</span>}
          </div>
          {error && <span className="text-[13px] text-[var(--stop)] font-medium p-[10px_12px] bg-[var(--stop-soft)] rounded-[4px] border border-[var(--stop)] opacity-90">{error}</span>}
        </div>
      </form>
    </div>
  );
}
