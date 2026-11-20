"use server";

import { saveResolution } from "@/lib/db-services";
import { requireActiveDbUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitResolution(formData: FormData) {
  const { dbUser } = await requireActiveDbUser();

  try {
    const agentName = ((formData.get("agentName") as string) || "").trim();
    const customerIssue = ((formData.get("customerIssue") as string) || "").trim();
    const symptoms = ((formData.get("symptoms") as string) || "").trim();
    const troubleshootingPerformed = ((formData.get("troubleshootingPerformed") as string) || "").trim();
    const finalResolution = ((formData.get("finalResolution") as string) || "").trim();
    const ticketSource = (formData.get("ticketSource") as "RICHPANEL" | "GHL" | "OTHER") || "RICHPANEL";
    const ticketId = ((formData.get("ticketId") as string) || "").trim() || null;
    const refundCreditAmount = ((formData.get("refundCreditAmount") as string) || "").trim() || null;
    const notesForFutureAgents = ((formData.get("notesForFutureAgents") as string) || "").trim() || null;
    const rawPlaybook = ((formData.get("relatedPlaybookId") as string) || "").trim();

    // Required fields validation
    if (!agentName) {
      return { error: "Agent Name is required." };
    }
    if (!customerIssue || !symptoms || !troubleshootingPerformed || !finalResolution) {
      return {
        error: "Please fill out all required fields (Customer Issue, Symptoms, Troubleshooting, and Final Resolution)."
      };
    }

    // Duplicate submission guard (check within past 5 minutes)
    if (ticketId) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const existing = await prisma.resolution.findFirst({
        where: {
          ticketId,
          ticketSource,
          createdAt: { gte: fiveMinutesAgo }
        }
      });
      if (existing) {
        return {
          error: `A resolution for ticket ${ticketId} was already submitted within the last 5 minutes.`
        };
      }
    }

    // Resolve related playbook ID if provided by slug or ID
    let relatedPlaybookId: string | null = null;
    if (rawPlaybook) {
      const found = await prisma.playbook.findFirst({
        where: {
          OR: [
            { id: rawPlaybook },
            { slug: rawPlaybook }
          ]
        },
        select: { id: true }
      });
      if (found) {
        relatedPlaybookId = found.id;
      }
    }

    // Update user display name if provided and not yet set or differed
    if (agentName && (!dbUser.name || dbUser.name === "Agent" || dbUser.name === "Anonymous")) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { name: agentName }
      }).catch(() => {});
    }

    const data = {
      ticketSource,
      ticketId,
      customerIssue,
      symptoms,
      troubleshootingPerformed,
      finalResolution,
      refundCreditAmount,
      notesForFutureAgents: notesForFutureAgents
        ? `[Submitted by ${agentName}] ${notesForFutureAgents}`
        : `[Submitted by ${agentName}]`,
      relatedPlaybookId,
      submittedByUserId: dbUser.id,
      status: "PENDING" as const
    };

    await saveResolution(data);
    revalidatePath("/admin/resolutions");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to submit resolution:", err);
    return { error: "We couldn't submit this resolution. Please try again." };
  }
}
