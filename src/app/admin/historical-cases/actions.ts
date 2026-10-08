"use server";

import { prisma } from "@/lib/prisma";
import { requireActiveDbUser } from "@/lib/server-auth";
import { isManager } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function setReviewStatus(id: string, status: "APPROVED" | "REJECTED" | "PENDING") {
  const { dbUser } = await requireActiveDbUser();
  if (!isManager(dbUser.role)) {
    throw new Error("Unauthorized");
  }

  await prisma.historicalSupportCase.update({
    where: { id },
    data: { reviewStatus: status }
  });

  revalidatePath("/admin/historical-cases");
}
