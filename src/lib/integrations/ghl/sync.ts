import { prisma } from "@/lib/prisma";
import { SupportCaseSource } from "@prisma/client";
import {
  fetchGhlPipelines,
  fetchGhlOpportunities,
  fetchGhlOpportunity,
  fetchGhlConversations,
  fetchGhlConversationMessages,
} from "./client";
import { normalizeGhlTicket, normalizeGhlMessages } from "./normalizer";
import { isApprovedPipeline, classifyStage } from "./rules";
import { GHLPipeline, GHLOpportunity, GHLConversation } from "./types";

export interface GhlSyncOptions {
  limit?: number;
  triggeredBy?: "MANUAL" | "CRON";
}

export async function runGhlSync(options: GhlSyncOptions = {}) {
  const limit = options.limit || 10; // controlled sync default
  const triggeredBy = options.triggeredBy || "MANUAL";
  const locationId = process.env.GHL_LOCATION_ID;

  // 1. Find last successful sync
  const lastSync = await prisma.integrationSyncState.findFirst({
    where: { source: SupportCaseSource.GHL, status: "SUCCESS" },
    orderBy: { completedAt: "desc" },
  });

  const updatedAfter = lastSync?.lastSourceTimestamp || null;

  // 2. Create running sync state
  const syncState = await prisma.integrationSyncState.create({
    data: {
      source: SupportCaseSource.GHL,
      status: "RUNNING",
      triggeredBy,
    },
  });

  let scanned = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errored = 0;
  let maxSourceTimestamp = updatedAfter?.getTime() || 0;

  try {
    // 3. Fetch Pipelines to build verified pipeline and stage mappings
    let pipelines: GHLPipeline[] = [];
    try {
      pipelines = await fetchGhlPipelines();
    } catch (err: any) {
      const isAuthScope = err.message?.includes("401") || err.message?.includes("not authorized for this scope");
      const safeErrorMsg = isAuthScope
        ? "GHL API Token unauthorized for opportunities/pipelines scope. Please grant opportunities.readonly scope in GoHighLevel Private Integrations."
        : `Failed to fetch GHL pipelines: ${err.message}`;

      await prisma.integrationSyncState.update({
        where: { id: syncState.id },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          errorMessage: safeErrorMsg,
        },
      });

      return {
        success: false,
        error: safeErrorMsg,
        scanned: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errored: 1,
      };
    }

    // Build map of approved pipelines
    const approvedPipelineMap = new Map<string, { id: string; name: string; stageMap: Map<string, string> }>();
    for (const p of pipelines) {
      if (isApprovedPipeline(p.name, p.id)) {
        const stageMap = new Map<string, string>();
        for (const s of p.stages || []) {
          stageMap.set(s.id, s.name);
        }
        approvedPipelineMap.set(p.id, { id: p.id, name: p.name, stageMap });
      }
    }

    if (approvedPipelineMap.size === 0) {
      const msg = "No approved GHL support pipelines found in location.";
      await prisma.integrationSyncState.update({
        where: { id: syncState.id },
        data: {
          status: "SUCCESS",
          completedAt: new Date(),
          errorMessage: msg,
        },
      });
      return { success: true, message: msg, scanned: 0, inserted: 0, updated: 0, skipped: 0, errored: 0 };
    }

    // 4. Fetch Opportunities in approved pipelines
    for (const [pipelineId, pipelineInfo] of approvedPipelineMap.entries()) {
      if (scanned >= limit) break;

      const oppsResponse = await fetchGhlOpportunities({
        pipelineId,
        limit: Math.min(limit - scanned, 50),
      });

      const opportunities = oppsResponse.opportunities || [];

      for (const opp of opportunities) {
        if (scanned >= limit) break;
        scanned++;

        const stageName = pipelineInfo.stageMap.get(opp.pipelineStageId) || opp.pipelineStageName;
        opp.pipelineName = pipelineInfo.name;
        opp.pipelineStageName = stageName;

        // Verify stage eligibility: NEVER use Won/Lost
        const stageClass = classifyStage(stageName);

        // Track highest updated timestamp
        const oppUpdated = opp.updatedAt ? new Date(opp.updatedAt).getTime() : 0;
        if (oppUpdated > maxSourceTimestamp) {
          maxSourceTimestamp = oppUpdated;
        }

        const contactId = opp.contactId || (opp as any).contact?.id;

        // If stage is UNRESOLVED, do not treat as resolved case.
        // If an existing case is moved into an unresolved stage, deactivate it.
        if (stageClass === "UNRESOLVED") {
          if (contactId) {
            const existingOppCase = await prisma.historicalSupportCase.findFirst({
              where: {
                source: SupportCaseSource.GHL,
                externalNumber: opp.id,
              },
            });
            if (existingOppCase && existingOppCase.active) {
              await prisma.historicalSupportCase.update({
                where: { id: existingOppCase.id },
                data: {
                  active: false,
                  status: stageName,
                  sourceUpdatedAt: opp.updatedAt ? new Date(opp.updatedAt) : undefined,
                },
              });
              updated++;
            } else {
              skipped++;
            }
          } else {
            skipped++;
          }
          continue;
        }

        // Fetch conversation for this contact if contactId exists
        if (!contactId) {
          skipped++;
          continue;
        }

        const convResponse = await fetchGhlConversations({
          contactId: contactId,
          limit: 1,
        });

        const conv = (convResponse.conversations || [])[0];
        if (!conv) {
          skipped++;
          continue;
        }

        try {
          // Check messages count and interplay (in memory)
          let messages = [];
          try {
            const rawMsgs = await fetchGhlConversationMessages(conv.id);
            messages = normalizeGhlMessages(rawMsgs);
          } catch {
            // If message fetch fails, continue with metadata
          }

          const msgCount = messages.length;
          const normalized = normalizeGhlTicket(conv, opp, locationId);

          // Check existing record in DB
          const existing = await prisma.historicalSupportCase.findUnique({
            where: {
              source_externalId: {
                source: SupportCaseSource.GHL,
                externalId: normalized.externalId,
              },
            },
          });

          if (existing) {
            // Skip if source not newer
            if (existing.sourceUpdatedAt && normalized.sourceUpdatedAt && existing.sourceUpdatedAt.getTime() >= normalized.sourceUpdatedAt.getTime()) {
              skipped++;
              continue;
            }

            // Update safe metadata without overwriting reviewStatus or extraction data
            await prisma.historicalSupportCase.update({
              where: { id: existing.id },
              data: {
                subject: normalized.subject,
                tags: normalized.tags,
                status: normalized.status,
                topic: normalized.topic,
                sourceUpdatedAt: normalized.sourceUpdatedAt,
                resolvedAt: normalized.resolvedAt,
                sourceUrl: normalized.sourceUrl,
                externalNumber: normalized.externalNumber,
                messageCount: msgCount,
                active: true,
              },
            });
            updated++;
          } else {
            // Insert new case
            await prisma.historicalSupportCase.create({
              data: {
                source: SupportCaseSource.GHL,
                externalId: normalized.externalId,
                externalNumber: normalized.externalNumber,
                subject: normalized.subject,
                tags: normalized.tags,
                status: normalized.status,
                topic: normalized.topic,
                sourceUrl: normalized.sourceUrl,
                openedAt: normalized.openedAt,
                resolvedAt: normalized.resolvedAt,
                sourceUpdatedAt: normalized.sourceUpdatedAt,
                messageCount: msgCount,
                reviewStatus: "PENDING",
                extractionStatus: "NOT_PROCESSED",
                active: true,
              },
            });
            inserted++;
          }
        } catch {
          console.error(`Historical GHL case save failed for conversation ${conv.id}. Skipping.`);
          errored++;
        }
      }
    }

    // 5. Incremental Reconciliation: Verify existing active GHL records
    // Confirm each active case still belongs to an approved support pipeline, has not moved to an
    // unapproved pipeline or unresolved stage, and still exists in GHL.
    const activeGhlCases = await prisma.historicalSupportCase.findMany({
      where: {
        source: SupportCaseSource.GHL,
        active: true,
      },
      select: {
        id: true,
        externalId: true,
        externalNumber: true,
        status: true,
        sourceUpdatedAt: true,
      },
    });

    for (const activeCase of activeGhlCases) {
      if (!activeCase.externalNumber) {
        // Cannot verify without opportunity ID: deactivate safely
        await prisma.historicalSupportCase.update({
          where: { id: activeCase.id },
          data: { active: false },
        });
        updated++;
        continue;
      }

      try {
        const liveOpp = await fetchGhlOpportunity(activeCase.externalNumber);
        if (!liveOpp) {
          // Opportunity no longer exists / 404: deactivate while preserving audit history
          await prisma.historicalSupportCase.update({
            where: { id: activeCase.id },
            data: { active: false },
          });
          updated++;
          continue;
        }

        // Verify it still belongs to an approved pipeline
        if (!isApprovedPipeline(liveOpp.pipelineName, liveOpp.pipelineId)) {
          await prisma.historicalSupportCase.update({
            where: { id: activeCase.id },
            data: { active: false },
          });
          updated++;
          continue;
        }

        // Verify stage is not unresolved
        const pipelineInfo = approvedPipelineMap.get(liveOpp.pipelineId);
        const stageName = pipelineInfo?.stageMap.get(liveOpp.pipelineStageId) || liveOpp.pipelineStageName;
        const stageClass = classifyStage(stageName);

        if (stageClass === "UNRESOLVED") {
          await prisma.historicalSupportCase.update({
            where: { id: activeCase.id },
            data: {
              active: false,
              status: stageName || activeCase.status,
              sourceUpdatedAt: liveOpp.updatedAt ? new Date(liveOpp.updatedAt) : activeCase.sourceUpdatedAt,
            },
          });
          updated++;
          continue;
        }
      } catch (err: any) {
        console.warn(`Reconciliation check skipped for GHL case ${activeCase.id}:`, err?.message);
      }
    }

    // 6. Update sync state
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
        lastSourceTimestamp: maxSourceTimestamp > 0 ? new Date(maxSourceTimestamp) : updatedAfter,
      },
    });

    return {
      success: true,
      scanned,
      inserted,
      updated,
      skipped,
      errored,
    };
  } catch (error: any) {
    errored++;
    const isRateLimit = error.message?.includes("429");
    const safeErrorMsg = isRateLimit
      ? "GHL API Rate Limit Exceeded"
      : `GHL sync failed due to an API or network error: ${error.message}`;

    console.error(`GHL Sync Error (safe): ${safeErrorMsg}`);

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
        errorMessage: safeErrorMsg,
      },
    });

    return { success: false, error: safeErrorMsg };
  }
}
