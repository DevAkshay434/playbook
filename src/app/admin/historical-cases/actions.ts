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

export async function extractCase(id: string) {
  const { dbUser } = await requireActiveDbUser();
  if (!isManager(dbUser.role)) {
    throw new Error("Unauthorized");
  }

  const supportCase = await prisma.historicalSupportCase.findUnique({
    where: { id }
  });

  if (!supportCase) {
    throw new Error("Case not found");
  }

  // Set processing state
  await prisma.historicalSupportCase.update({
    where: { id },
    data: { 
      extractionStatus: "PROCESSING",
      reviewStatus: "PENDING" // Reset review if re-extracting
    }
  });
  
  revalidatePath("/admin/historical-cases");

  // In a real flow, this would fire an async background job or hit an API route
  // that runs `extractHistoricalCase()`. Because Vercel free tier might timeout
  // on long AI calls, Next.js background workers or a separate route is ideal.
  // For now, we will simulate the "FAILED - Missing API key" boundary directly 
  // by updating the status to FAILED since no AI provider is configured.
  
  try {
     // await runExtractionJob(id) ...
     throw new Error("Missing AI Provider Configuration. Please provide OPENAI_API_KEY.");
  } catch (err: any) {
     await prisma.historicalSupportCase.update({
       where: { id },
       data: { 
         extractionStatus: "FAILED" 
       }
     });
     console.error(`Safe log: Extraction failed for case ${id}. Reason:`, err.message);
     revalidatePath("/admin/historical-cases");
  }
}

export async function extractNext5() {
  const { dbUser } = await requireActiveDbUser();
  if (!isManager(dbUser.role)) {
    throw new Error("Unauthorized");
  }

  const cases = await prisma.historicalSupportCase.findMany({
    where: { extractionStatus: "NOT_PROCESSED" },
    take: 5
  });

  for (const c of cases) {
    await extractCase(c.id).catch(() => {});
  }
}
