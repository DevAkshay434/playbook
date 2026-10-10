import { fetchClosedTickets } from './client';
import { normalizeRichpanelTicket } from './normalizer';
import { prisma } from '@/lib/prisma';
import { SupportCaseSource } from '@prisma/client';

export interface SyncOptions {
  limit?: number; // Soft limit for manual syncs
  triggeredBy?: "MANUAL" | "CRON";
}

export async function runRichpanelSync(options: SyncOptions = {}) {
  const limit = options.limit || 1000; // scheduled sync defaults to 1000 max
  const triggeredBy = options.triggeredBy || "MANUAL";
  
  // Find last successful sync
  const lastSync = await prisma.integrationSyncState.findFirst({
    where: { source: SupportCaseSource.RICHPANEL, status: "SUCCESS" },
    orderBy: { completedAt: "desc" }
  });

  const updatedAfter = lastSync?.lastSourceTimestamp || null;

  // 1. Create a sync state record
  const syncState = await prisma.integrationSyncState.create({
    data: {
      source: SupportCaseSource.RICHPANEL,
      status: "RUNNING",
      triggeredBy: triggeredBy,
    }
  });
  
  let scanned = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errored = 0;
  
  let nextUrl: string | null | undefined = null;
  let maxSourceTimestamp = updatedAfter?.getTime() || 0;

  try {
    let hasMore = true;

    while (hasMore && scanned < limit) {
      const data = await fetchClosedTickets(100, nextUrl, updatedAfter);
      const tickets = data.ticket || [];
      
      for (const t of tickets) {
        if (scanned >= limit) break;
        scanned++;
        
        // Track the highest updated_at timestamp seen in this sync
        const ticketUpdatedTimestamp = new Date(t.updated_at).getTime();
        if (ticketUpdatedTimestamp > maxSourceTimestamp) {
          maxSourceTimestamp = ticketUpdatedTimestamp;
        }

        // Check existing
        const existing = await prisma.historicalSupportCase.findUnique({
          where: {
            source_externalId: {
              source: SupportCaseSource.RICHPANEL,
              externalId: String(t.id) // Ensure string external ID
            }
          }
        });

        // Eligibility Rules
        if (t.is_trashed) {
          if (existing) {
            await prisma.historicalSupportCase.update({
              where: { id: existing.id },
              data: { active: false, sourceUpdatedAt: new Date(t.updated_at) }
            });
            updated++;
          } else {
            skipped++;
          }
          continue;
        }
        
        if (!t.last_message_sender_type) {
          skipped++;
          continue;
        }
        
        const tags = t.tags || [];
        const isSpam = tags.some(tag => tag.toLowerCase().includes('spam') || tag.toLowerCase().includes('test'));
        if (isSpam) {
          skipped++;
          continue;
        }

        const comments = t.comments || [];
        const msgCount = comments.length;

        const hasCustomer = comments.some((c:any) => c.is_operator === false);
        const hasAgent = comments.some((c:any) => c.is_operator === true);
        
        try {
          const normalized = normalizeRichpanelTicket(t);
          if (!normalized.externalId) {
            skipped++;
            continue;
          }
        
          if (existing) {
            // Skip if not newer
            if (existing.sourceUpdatedAt && existing.sourceUpdatedAt.getTime() >= normalized.sourceUpdatedAt.getTime()) {
              skipped++;
              continue;
            }
            
            // If source changes, we do NOT delete extraction data.
            // Just update safe metadata and ensure it's active.
            await prisma.historicalSupportCase.update({
              where: { id: existing.id },
              data: {
                subject: normalized.subject,
                tags: normalized.tags,
                sourceUpdatedAt: normalized.sourceUpdatedAt,
                resolvedAt: normalized.closedAt,
                sourceUrl: normalized.sourceUrl,
                externalNumber: normalized.externalNumber,
                active: true,
                messageCount: msgCount
              }
            });
            updated++;
          } else {
            await prisma.historicalSupportCase.create({
              data: {
                source: SupportCaseSource.RICHPANEL,
                externalId: normalized.externalId,
                externalNumber: normalized.externalNumber,
                subject: normalized.subject,
                tags: normalized.tags,
                sourceUrl: normalized.sourceUrl,
                openedAt: normalized.openedAt,
                resolvedAt: normalized.closedAt,
                sourceUpdatedAt: normalized.sourceUpdatedAt,
                reviewStatus: "PENDING",
                extractionStatus: "NOT_PROCESSED",
                active: true,
                messageCount: msgCount
              }
            });
            inserted++;
          }
        } catch (err: any) {
          // Safe server-side log for individual item error
          console.error(`Historical case save failed for externalId ${t.id}. Skipping.`);
          errored++;
        }
      }

      nextUrl = data.next_page;
      hasMore = !!nextUrl;
    }
    
    await prisma.integrationSyncState.update({
      where: { id: syncState.id },
      data: {
        status: "SUCCESS",
        completedAt: new Date(),
        recordsScanned: scanned,
        recordsInserted: inserted,
        recordsUpdated: updated,
        recordsSkipped: skipped,
        recordsErrored: errored,
        lastSourceTimestamp: maxSourceTimestamp > 0 ? new Date(maxSourceTimestamp) : updatedAfter
      }
    });
    
    return { success: true, scanned, inserted, updated, skipped, errored };
  } catch (error: any) {
    const isRateLimit = error.message?.includes("429");
    const safeErrorMsg = isRateLimit 
      ? "Richpanel API Rate Limit Exceeded" 
      : "Richpanel sync failed due to an API or network error.";
    
    console.error(`Richpanel Sync Error (safe): ${safeErrorMsg}`);

    await prisma.integrationSyncState.update({
      where: { id: syncState.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        recordsScanned: scanned,
        recordsInserted: inserted,
        recordsUpdated: updated,
        recordsSkipped: skipped,
        recordsErrored: errored,
        errorMessage: safeErrorMsg
      }
    });
    
    return { success: false, error: safeErrorMsg };
  }
}
