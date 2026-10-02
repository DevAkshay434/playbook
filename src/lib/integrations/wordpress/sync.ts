import { prisma } from "@/lib/prisma";
import { fetchKBPages } from "./client";
import { mapWPPageToArticle } from "./mapper";
import type { SyncTrigger } from "@prisma/client";

export interface SyncResult {
  totalFetched: number;
  added: number;
  updated: number;
  deactivated: number;
  syncRunId: string;
}

export async function syncKnowledgeBase(triggeredBy: SyncTrigger = "MANUAL"): Promise<SyncResult> {
  // Create sync run record
  const syncRun = await prisma.knowledgeBaseSyncRun.create({
    data: {
      source: "wordpress",
      triggeredBy,
      status: "RUNNING",
    }
  });

  try {
    const pages = await fetchKBPages();
    let updatedCount = 0;
    let addedCount = 0;

    for (const page of pages) {
      const mapped = mapWPPageToArticle(page);
      
      const existing = await prisma.knowledgeBaseArticle.findUnique({
        where: { externalId: mapped.externalId }
      });

      if (existing) {
        if (existing.wordpressModifiedAt.getTime() !== mapped.wordpressModifiedAt.getTime()) {
          await prisma.knowledgeBaseArticle.update({
            where: { id: existing.id },
            data: {
              ...mapped,
              indexedAt: new Date()
            }
          });
          updatedCount++;
        }
      } else {
        await prisma.knowledgeBaseArticle.create({
          data: {
            ...mapped,
            indexedAt: new Date()
          }
        });
        addedCount++;
      }
    }

    // Deactivate articles that are no longer published
    const fetchedIds = pages.map(p => p.id.toString());
    const deactivated = await prisma.knowledgeBaseArticle.updateMany({
      where: {
        source: "wordpress",
        active: true,
        externalId: { notIn: fetchedIds }
      },
      data: { active: false }
    });

    // Mark sync run as successful
    await prisma.knowledgeBaseSyncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "SUCCESS",
        completedAt: new Date(),
        totalFetched: pages.length,
        addedCount,
        updatedCount,
        deactivatedCount: deactivated.count,
      }
    });

    return {
      totalFetched: pages.length,
      added: addedCount,
      updated: updatedCount,
      deactivated: deactivated.count,
      syncRunId: syncRun.id,
    };
  } catch (error: any) {
    // Record failure — do NOT delete previously indexed articles
    await prisma.knowledgeBaseSyncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage: error?.message?.slice(0, 500) || "Unknown sync error",
      }
    });
    throw error;
  }
}
