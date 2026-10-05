import { prisma } from "@/lib/prisma";
import { isDbConnected } from "@/lib/db-services";
import { revalidatePath } from "next/cache";

export default async function ResolutionsAdminPage() {
  let resolutions: any[] = [];
  
  if (isDbConnected) {
    resolutions = await prisma.resolution.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        submittedBy: { select: { name: true, email: true } },
        reviewedBy: { select: { name: true } },
        relatedPlaybook: { select: { title: true } }
      }
    });
  }

  async function updateStatus(formData: FormData) {
    "use server";
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    const id = formData.get("id") as string;
    const status = formData.get("status") as any;
    if (isDbConnected && session?.user?.id) {
      await prisma.resolution.update({
        where: { id },
        data: { 
          status, 
          reviewedAt: new Date(),
          reviewedByUserId: session.user.id as string
        }
      });
      revalidatePath("/admin/resolutions");
    }
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[3px] mb-[10px]">
        <h2 className="text-[26px] font-bold tracking-[-0.015em]">Resolution Review</h2>
        <p className="text-[var(--ink-2)] text-[13.5px]">Approve submitted resolutions for historical tracking.</p>
      </div>

      {resolutions.length === 0 ? (
        <div className="border border-dashed border-[var(--line)] rounded-[var(--radius)] p-[34px_20px] text-center text-[var(--ink-3)] text-[14px]">
          No resolutions found. (Database connection might be missing).
        </div>
      ) : (
        <div className="flex flex-col gap-[15px]">
          {resolutions.map(res => (
            <div key={res.id} className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius)] p-[20px] flex flex-col gap-[14px]">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-[4px]">
                  <h3 className="font-semibold text-[16px]">{res.customerIssue}</h3>
                  <div className="font-mono text-[11px] text-[var(--ink-3)] flex gap-[8px]">
                    <span>Ticket: {res.ticketId || "N/A"} ({res.ticketSource})</span>
                    <span>Submitted by: {res.submittedBy?.name || res.submittedBy?.email || "Unknown"}</span>
                  </div>
                </div>
                <span className={`font-display font-bold text-[9px] tracking-[0.1em] uppercase rounded-[4px] px-[7px] py-[3px] ${
                  res.status === "PENDING" ? "bg-[var(--warn-soft)] text-[var(--warn)]" :
                  res.status === "APPROVED" ? "bg-[var(--ok-soft)] text-[var(--ok)]" :
                  "bg-[var(--stop-soft)] text-[var(--stop)]"
                }`}>
                  {res.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] bg-[var(--ground)] p-[12px] rounded-[6px] border border-[var(--line-soft)]">
                <div className="flex flex-col gap-[4px]">
                  <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Symptoms</span>
                  <p className="text-[13px]">{res.symptoms || "N/A"}</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Troubleshooting</span>
                  <p className="text-[13px]">{res.troubleshootingPerformed || "N/A"}</p>
                </div>
                <div className="flex flex-col gap-[4px] md:col-span-2">
                  <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Final Resolution</span>
                  <p className="text-[13px]">{res.finalResolution}</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Refund/Credit</span>
                  <p className="text-[13px]">{res.refundCreditAmount || "None"}</p>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="font-display font-bold text-[9px] tracking-[0.1em] uppercase text-[var(--ink-3)]">Related SOP</span>
                  <p className="text-[13px]">{res.relatedPlaybookId || "None"}</p>
                </div>
              </div>

              {res.status === "PENDING" && (
                <div className="flex gap-[10px] mt-[10px]">
                  <form action={updateStatus}>
                    <input type="hidden" name="id" value={res.id} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <button type="submit" className="bg-[var(--ok)] text-white border-0 font-display font-bold text-[11px] tracking-[0.05em] uppercase rounded-[4px] px-[12px] py-[6px] cursor-pointer hover:opacity-90">Approve</button>
                  </form>
                  <form action={updateStatus}>
                    <input type="hidden" name="id" value={res.id} />
                    <input type="hidden" name="status" value="REJECTED" />
                    <button type="submit" className="bg-[var(--stop)] text-white border-0 font-display font-bold text-[11px] tracking-[0.05em] uppercase rounded-[4px] px-[12px] py-[6px] cursor-pointer hover:opacity-90">Reject</button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
