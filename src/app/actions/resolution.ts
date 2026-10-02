"use server";
import { saveResolution } from "@/lib/db-services";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitResolution(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const data = {
    ticketSource: formData.get("ticketSource") as "RICHPANEL" | "GHL" | "OTHER",
    ticketId: (formData.get("ticketId") as string) || null,
    customerIssue: formData.get("customerIssue") as string,
    symptoms: formData.get("symptoms") as string,
    troubleshootingPerformed: formData.get("troubleshootingPerformed") as string,
    finalResolution: formData.get("finalResolution") as string,
    refundCreditAmount: (formData.get("refundCreditAmount") as string) || null,
    notesForFutureAgents: (formData.get("notesForFutureAgents") as string) || null,
    submittedByUserId: session.user.id,
    status: "PENDING"
  };

  await saveResolution(data);
  revalidatePath("/admin/resolutions");
  return { success: true };
}
