"use server";
import { prisma } from "@/lib/prisma";
import { auth, isManager } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function savePlaybook(formData: FormData) {
  const session = await auth();
  if (!isManager((session?.user as any)?.role)) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id") as string | null;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const categoryId = formData.get("categoryId") as string;
  const authority = formData.get("authority") as string;
  const summary = (formData.get("summary") as string) || null;
  
  const customerPhrases = (formData.get("customerPhrases") as string).split("\n").filter(Boolean);
  const aliases = (formData.get("aliases") as string).split("\n").filter(Boolean);
  const facts = (formData.get("facts") as string).split("\n").filter(Boolean);
  const troubleshootingSteps = (formData.get("troubleshootingSteps") as string).split("\n").filter(Boolean);
  const suggestedResponse = (formData.get("suggestedResponse") as string) || null;
  const dontDo = (formData.get("dontDo") as string).split("\n").filter(Boolean);
  const source = (formData.get("source") as string) || null;
  const lastConfirmed = (formData.get("lastConfirmed") as string) || null;
  const knownGap = formData.get("knownGap") === "true";
  const active = formData.get("active") !== "false";
  
  const changeNote = (formData.get("changeNote") as string) || null;

  const data = {
    title, slug, categoryId, authority, summary, customerPhrases, aliases, facts,
    troubleshootingSteps, suggestedResponse, dontDo, source, lastConfirmed, knownGap, active
  };

  let savedPlaybook;

  if (id) {
    const previous = await prisma.playbook.findUnique({ where: { id } });
    if (!previous) throw new Error("Not found");

    savedPlaybook = await prisma.playbook.update({
      where: { id },
      data
    });

    const versionCount = await prisma.playbookVersion.count({ where: { playbookId: id } });
    await prisma.playbookVersion.create({
      data: {
        playbookId: id,
        versionNumber: versionCount + 1,
        snapshot: previous as any,
        changedByUserId: session!.user!.id!,
        changeNote
      }
    });
  } else {
    savedPlaybook = await prisma.playbook.create({
      data
    });
  }

  revalidatePath("/admin/playbooks");
  revalidatePath(`/playbook/${slug}`);
  return { success: true, id: savedPlaybook.id };
}
