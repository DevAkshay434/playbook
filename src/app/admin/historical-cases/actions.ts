"use server";

import { prisma } from "@/lib/prisma";
import { requireActiveDbUser } from "@/lib/server-auth";
import { isManager } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { fetchTicket } from "@/lib/integrations/richpanel/client";
import { extractHistoricalCase, EXTRACTION_VERSION } from "@/lib/historical-cases/extraction/extractor";
import { HistoricalConversationInput } from "@/lib/historical-cases/extraction/types";

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

  // Pre-flight check: Is AI configured?
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("AI extraction is not configured yet. Add the OpenAI API configuration to enable extraction.");
  }

  // Set processing state (idempotent, resets PENDING)
  await prisma.historicalSupportCase.update({
    where: { id },
    data: { 
      extractionStatus: "PROCESSING",
      reviewStatus: "PENDING"
    }
  });
  
  try {
    let input: HistoricalConversationInput;

    if (supportCase.source === "RICHPANEL") {
      // 1. Fetch original ticket from Richpanel (in memory only)
      const ticket = await fetchTicket(supportCase.externalId);
      
      const tagsArray = Array.isArray(supportCase.tags) ? supportCase.tags as string[] : [];
      
      const profileInfo = ticket.customer_profile || {};
      
      input = {
        source: "RICHPANEL",
        externalId: supportCase.externalId,
        subject: supportCase.subject,
        tags: tagsArray,
        openedAt: supportCase.openedAt,
        resolvedAt: supportCase.resolvedAt,
        customerProfile: {
          name: profileInfo.name || null,
          email: profileInfo.email || null,
          phone: profileInfo.phone || null,
        },
        messages: (ticket.comments || []).map((c: any) => ({
          role: (c.is_operator === false ? "CUSTOMER" : "AGENT") as "CUSTOMER" | "AGENT" | "INTERNAL" | "SYSTEM",
          text: c.plain_body || c.body || "",
          timestamp: new Date(c.created_at)
        })).filter((m: any) => m.text) // filter empty
      };
    } else {
      throw new Error(`Extraction for source ${supportCase.source} not implemented yet`);
    }

    // 2. Perform AI Extraction
    
    // Deterministic Pre-flight: Prevent wasted tokens
    const hasCustomer = input.messages.some(m => m.role === "CUSTOMER");
    const hasAgent = input.messages.some(m => m.role === "AGENT");
    
    if (input.messages.length === 0 || !hasCustomer || !hasAgent) {
      // Mark as unusable safely without calling OpenAI
      await prisma.historicalSupportCase.update({
        where: { id },
        data: {
          extractionStatus: "READY",
          issueText: null,
          symptoms: null,
          troubleshooting: null,
          resolutionText: null,
          topic: null,
          confidence: 0,
          evidenceQuality: "LOW",
          usableAsHistoricalCase: false,
          extractedAt: new Date(),
          extractionVersion: "1.0.0-deterministic-skip"
        }
      });
      return;
    }

    const extractionResult = await extractHistoricalCase(input);

    // 3. Persist Extracted Data
    await prisma.historicalSupportCase.update({
      where: { id },
      data: {
        extractionStatus: "READY",
        issueText: extractionResult.issueSummary,
        symptoms: extractionResult.symptoms,
        troubleshooting: extractionResult.troubleshooting,
        resolutionText: extractionResult.finalResolution,
        topic: extractionResult.topic,
        confidence: extractionResult.confidence,
        evidenceQuality: extractionResult.evidenceQuality,
        usableAsHistoricalCase: extractionResult.usableAsHistoricalCase,
        extractedAt: new Date(),
        extractionVersion: EXTRACTION_VERSION
      }
    });

  } catch (err: any) {
    // Fail gracefully
    await prisma.historicalSupportCase.update({
      where: { id },
      data: { 
        extractionStatus: "FAILED" 
      }
    });
    console.error(`Safe log: Extraction failed for case ${id}. Reason:`, err.message);
  } finally {
    revalidatePath("/admin/historical-cases");
  }
}

export async function extractNext5() {
  const { dbUser } = await requireActiveDbUser();
  if (!isManager(dbUser.role)) {
    throw new Error("Unauthorized");
  }
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("AI extraction is not configured yet. Add the OpenAI API configuration to enable extraction.");
  }

  const cases = await prisma.historicalSupportCase.findMany({
    where: { extractionStatus: { in: ["NOT_PROCESSED", "FAILED"] }, active: true },
    orderBy: { messageCount: 'desc' },
    take: 5
  });

  for (const c of cases) {
    await extractCase(c.id).catch(() => {});
  }
}

export async function recoverStaleProcessing() {
  const { dbUser } = await requireActiveDbUser();
  if (!isManager(dbUser.role)) {
    throw new Error("Unauthorized");
  }

  // 30 minutes ago
  const threshold = new Date(Date.now() - 30 * 60 * 1000);

  const staleCases = await prisma.historicalSupportCase.findMany({
    where: { 
      extractionStatus: "PROCESSING", 
      updatedAt: { lt: threshold } 
    }
  });

  if (staleCases.length > 0) {
    await prisma.historicalSupportCase.updateMany({
      where: { 
        id: { in: staleCases.map(c => c.id) } 
      },
      data: {
        extractionStatus: "FAILED",
        issueText: "Extraction interrupted. Retry required."
      }
    });
  }
  
  revalidatePath("/admin/historical-cases");
  return staleCases.length;
}
