import { fetchClosedTickets } from './client';
import { normalizeRichpanelTicket } from './normalizer';
import { prisma } from '@/lib/prisma';
import { SupportCaseSource } from '@prisma/client';

export interface SyncOptions {
  limit?: number;
}

export async function runRichpanelSync(options: SyncOptions = {}) {
  const limit = options.limit || 10;
  
  // 1. Create a sync state record
  const syncState = await prisma.integrationSyncState.create({
    data: {
      source: SupportCaseSource.RICHPANEL,
      status: "RUNNING",
      triggeredBy: "MANUAL",
    }
  });
  
  let scanned = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  
  try {
    const data = await fetchClosedTickets(100);
    const tickets = data.ticket || [];
    
    for (const t of tickets) {
      if (scanned >= limit) break;
      
      scanned++;
      
      // Eligibility Rule
      if (t.is_trashed) {
        skipped++;
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
      
      const normalized = normalizeRichpanelTicket(t);
      if (!normalized.externalId) {
        skipped++;
        continue;
      }
      
      // Check existing
      const existing = await prisma.historicalSupportCase.findUnique({
        where: {
          source_externalId: {
            source: SupportCaseSource.RICHPANEL,
            externalId: normalized.externalId
          }
        }
      });
      
      try {
        if (existing) {
          // Skip if not newer
          if (existing.sourceUpdatedAt && existing.sourceUpdatedAt.getTime() >= normalized.sourceUpdatedAt.getTime()) {
            skipped++;
            continue;
          }
          
          await prisma.historicalSupportCase.update({
            where: { id: existing.id },
            data: {
              subject: normalized.subject,
              tags: normalized.tags,
              sourceUpdatedAt: normalized.sourceUpdatedAt,
              resolvedAt: normalized.closedAt,
              sourceUrl: normalized.sourceUrl,
              externalNumber: normalized.externalNumber // ensure safe type updating too
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
              extractionStatus: "NOT_PROCESSED"
            }
          });
          inserted++;
        }
      } catch (err: any) {
        // Safe server-side log for individual item error
        console.error(`Historical case normalization/save failed for externalId ${normalized.externalId}: invalid type or db error.`);
        throw err; // bubble up to fail the sync safely
      }
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
      }
    });
    
    return { success: true, scanned, inserted, updated, skipped };
  } catch (error: any) {
    // Keep it safe in the DB and Logs
    const safeErrorMsg = "Richpanel sync failed while saving a historical case.";
    console.error(`Richpanel Sync Error (safe): ${safeErrorMsg}`, error.message);

    await prisma.integrationSyncState.update({
      where: { id: syncState.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        recordsScanned: scanned,
        recordsInserted: inserted,
        recordsUpdated: updated,
        recordsSkipped: skipped,
        errorMessage: safeErrorMsg
      }
    });
    
    return { success: false, error: safeErrorMsg };
  }
}
