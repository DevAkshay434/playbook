import { fetchClosedTickets } from './client';
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
      
      const externalId = t.id || t.conversation_no;
      if (!externalId) {
        skipped++;
        continue;
      }
      
      const sourceUpdatedAt = new Date(t.updated_at);
      const openedAt = new Date(t.created_at);
      const closedAt = t.closed_at ? new Date(t.closed_at) : new Date(t.updated_at);
      
      // Check existing
      const existing = await prisma.historicalSupportCase.findUnique({
        where: {
          source_externalId: {
            source: SupportCaseSource.RICHPANEL,
            externalId: externalId
          }
        }
      });
      
      if (existing) {
        // Skip if not newer
        if (existing.sourceUpdatedAt && existing.sourceUpdatedAt.getTime() >= sourceUpdatedAt.getTime()) {
          skipped++;
          continue;
        }
        
        await prisma.historicalSupportCase.update({
          where: { id: existing.id },
          data: {
            subject: t.subject,
            tags: tags,
            sourceUpdatedAt,
            resolvedAt: closedAt,
            sourceUrl: t.url
          }
        });
        updated++;
      } else {
        await prisma.historicalSupportCase.create({
          data: {
            source: SupportCaseSource.RICHPANEL,
            externalId: externalId,
            externalNumber: t.conversation_no || null,
            subject: t.subject,
            tags: tags,
            sourceUrl: t.url,
            openedAt,
            resolvedAt: closedAt,
            sourceUpdatedAt,
            reviewStatus: "PENDING",
            extractionStatus: "NOT_PROCESSED"
          }
        });
        inserted++;
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
    await prisma.integrationSyncState.update({
      where: { id: syncState.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        recordsScanned: scanned,
        recordsInserted: inserted,
        recordsUpdated: updated,
        recordsSkipped: skipped,
        errorMessage: error.message
      }
    });
    return { success: false, error: error.message };
  }
}
