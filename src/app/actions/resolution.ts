"use server";
import { saveResolution } from "@/lib/db-services";
import { requireActiveDbUser } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";

export async function submitResolution(formData: FormData) {
  const { dbUser, session } = await requireActiveDbUser();

  try {
    const data = {
      ticketSource: formData.get("ticketSource") as "RICHPANEL" | "GHL" | "OTHER",
      ticketId: (formData.get("ticketId") as string) || null,
      customerIssue: formData.get("customerIssue") as string,
      symptoms: formData.get("symptoms") as string,
      troubleshootingPerformed: formData.get("troubleshootingPerformed") as string,
      finalResolution: formData.get("finalResolution") as string,
      refundCreditAmount: (formData.get("refundCreditAmount") as string) || null,
      notesForFutureAgents: (formData.get("notesForFutureAgents") as string) || null,
      submittedByUserId: session.user.id as string,
      status: "PENDING" as any
    };

    if (!data.customerIssue || !data.symptoms || !data.troubleshootingPerformed || !data.finalResolution) {
      return { error: "Please fill out all required fields." };
    }

    await saveResolution(data);
    revalidatePath("/admin/resolutions");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to submit resolution:", err);
    return { error: "We couldn't submit this resolution. Please try again." };
  }
}
