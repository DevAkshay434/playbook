"use client";

import { useState, useTransition } from "react";
import { submitResolution } from "@/app/actions/resolution";

interface AddResolutionProps {
  playbooks?: any[];
}

export default function AddResolution({ playbooks = [] }: AddResolutionProps) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const result = await submitResolution(formData);
        if (result?.error) {
          setError(result.error);
        } else {
          setSubmitted(true);
          form.reset();
          setTimeout(() => setSubmitted(false), 6000);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "We couldn't submit this resolution. Please try again.");
      }
    });
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[22px] flex flex-col gap-[20px] shadow-[var(--shadow)]">
      {/* Canonical Workflow Explanation */}
      <div className="flex flex-col gap-[8px]">
        <h3 className="font-display font-bold text-[11px] tracking-[0.14em] uppercase text-[var(--accent)]">
          Canonical In-App Resolution Workflow
        </h3>
        <p className="text-[13.5px] text-[var(--ink-2)] m-0">
          When you resolve a non-standard ticket or recurring issue, submit it directly below while the details are fresh.
        </p>
        <ol className="list-none pl-0 gap-[10px] flex flex-col m-0 mt-[4px]" style={{ counterReset: "s" }}>
          <li className="relative pl-[28px] text-[13.5px] text-[var(--ink-2)]" style={{ counterIncrement: "s" }}>
            <span className="absolute left-0 top-[1px] w-[19px] h-[19px] rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[11px] grid place-items-center">
              1
            </span>
            <strong>Direct Submission:</strong> Fill out the form below with the ticket ID, observable symptoms, and verified resolution.
          </li>
          <li className="relative pl-[28px] text-[13.5px] text-[var(--ink-2)]" style={{ counterIncrement: "s" }}>
            <span className="absolute left-0 top-[1px] w-[19px] h-[19px] rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[11px] grid place-items-center">
              2
            </span>
            <strong>Manager Review:</strong> Submissions enter the manager review queue with status <code>PENDING</code> for quality check and verification.
          </li>
          <li className="relative pl-[28px] text-[13.5px] text-[var(--ink-2)]" style={{ counterIncrement: "s" }}>
            <span className="absolute left-0 top-[1px] w-[19px] h-[19px] rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[11px] grid place-items-center">
              3
            </span>
            <strong>Playbook Standardization:</strong> Approved cases are standardized into official 5-part cards with explicit authority limits (Handle it / Your call / Escalate) and become permanently searchable.
          </li>
        </ol>
      </div>

      <hr className="border-0 border-t border-[var(--line)] m-0" />

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
        <div className="flex justify-between items-center">
          <h4 className="font-display font-bold text-[11px] tracking-[0.12em] uppercase text-[var(--ink-3)] m-0">
            Submit New Case Resolution
          </h4>
          <span className="text-[11.5px] text-[var(--ink-3)] font-mono">* Required fields</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
          {/* Agent Name */}
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
              Agent Name *
            </label>
            <input
              required
              type="text"
              name="agentName"
              placeholder="e.g. Alex Miller"
              className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent"
            />
          </div>

          {/* Ticket Source */}
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
              Ticket Source *
            </label>
            <select
              required
              name="ticketSource"
              defaultValue="RICHPANEL"
              className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent"
            >
              <option value="RICHPANEL">Richpanel Ticket</option>
              <option value="GHL">GoHighLevel Conversation</option>
              <option value="OTHER">Other / Phone Call</option>
            </select>
          </div>

          {/* Ticket ID */}
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
              Ticket / Opp #
            </label>
            <input
              type="text"
              name="ticketId"
              placeholder="e.g. #48291 or opp_abc"
              className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent"
            />
          </div>
        </div>

        {/* Customer Issue */}
        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
            Customer Issue (In their words) *
          </label>
          <input
            required
            type="text"
            name="customerIssue"
            placeholder='What the customer reported, e.g. "Water softener is clicking loudly and salt isn&apos;t dropping"'
            className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent"
          />
        </div>

        {/* Symptoms */}
        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
            Observable Symptoms &amp; Details *
          </label>
          <input
            required
            type="text"
            name="symptoms"
            placeholder="Error codes, valve screen readings, water hardness measurement, leak location..."
            className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent"
          />
        </div>

        {/* Troubleshooting Performed */}
        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
            Troubleshooting Performed *
          </label>
          <textarea
            required
            name="troubleshootingPerformed"
            rows={3}
            placeholder="Steps taken to diagnose and isolate the problem (e.g. checked bypass valve position, tested brine draw, inspected injector nozzle)..."
            className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent resize-y"
          />
        </div>

        {/* Final Resolution */}
        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
            Final Resolution &amp; Customer Agreement *
          </label>
          <textarea
            required
            name="finalResolution"
            rows={3}
            placeholder="Exact solution provided (e.g. walked customer through clearing brine line obstruction, sent replacement injector under warranty, confirmed water softened)..."
            className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
          {/* Refund/Credit Amount */}
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
              Refund / Concession / Credit Amount
            </label>
            <input
              type="text"
              name="refundCreditAmount"
              placeholder="$0.00 or N/A"
              className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent"
            />
          </div>

          {/* Related Playbook */}
          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
              Related Playbook / SOP
            </label>
            {playbooks && playbooks.length > 0 ? (
              <select
                name="relatedPlaybookId"
                className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent"
              >
                <option value="">None / New Issue</option>
                {playbooks.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.slug})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="relatedPlaybookId"
                placeholder="e.g. meter-not-regenerating"
                className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent"
              />
            )}
          </div>
        </div>

        {/* Notes for Future Agents */}
        <div className="flex flex-col gap-[5px]">
          <label className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-[var(--ink-3)]">
            Notes / Advice for Future Agents (Avoid List)
          </label>
          <textarea
            name="notesForFutureAgents"
            rows={2}
            placeholder="Anything the next agent should avoid or be careful of when dealing with this issue..."
            className="font-body text-[14px] text-[var(--ink)] bg-[var(--ground)] border border-[var(--line)] rounded-[6px] p-[8px_10px] focus:outline focus:outline-2 focus:outline-[var(--accent)] focus:outline-offset-1 focus:border-transparent resize-y"
          />
        </div>

        {/* Action Button & Status */}
        <div className="flex flex-col gap-[10px] pt-[4px]">
          <div className="flex items-center gap-[15px]">
            <button
              type="submit"
              disabled={isPending}
              className="font-display font-bold text-[12px] tracking-[0.05em] uppercase bg-[var(--navy)] text-white border-0 rounded-[6px] p-[10px_20px] cursor-pointer hover:bg-[var(--accent)] transition-colors disabled:opacity-50 flex items-center gap-[8px]"
            >
              {isPending && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {isPending ? "Submitting..." : "Submit to Review Queue"}
            </button>
            {submitted && (
              <span className="text-[13px] text-[var(--ok)] font-medium bg-[var(--ok-soft)] border border-[var(--ok)] rounded-[4px] px-[10px] py-[6px]">
                ✓ Resolution submitted! Added to manager review queue.
              </span>
            )}
          </div>

          {error && (
            <div className="text-[13px] text-[var(--stop)] font-medium p-[10px_14px] bg-[var(--stop-soft)] rounded-[5px] border border-[var(--stop)]">
              {error}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
