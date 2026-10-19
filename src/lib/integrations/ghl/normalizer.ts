import { GHLConversation, GHLOpportunity, GHLMessage } from "./types";
import { getCategoryForIssueStage } from "./rules";
import { HistoricalConversationMessage } from "@/lib/historical-cases/extraction/types";

export interface NormalizedGhlTicket {
  externalId: string;
  externalNumber: string | null;
  subject: string | null;
  tags: string[];
  status: string | null;
  sourceUrl: string | null;
  openedAt: Date | null;
  sourceUpdatedAt: Date | null;
  resolvedAt: Date | null;
  topic: string | null;
}

export function normalizeGhlTicket(
  conversation: GHLConversation,
  opportunity?: GHLOpportunity | null,
  locationId?: string | null
): NormalizedGhlTicket {
  const externalId = conversation.id;
  const externalNumber = opportunity?.id || conversation.id;

  // Build tags
  const tags: string[] = Array.isArray(conversation.tags) ? [...conversation.tags] : [];

  // If this opportunity stage maps to a Playbook category, add as tag/topic
  const mappedCategory = opportunity?.pipelineStageName
    ? getCategoryForIssueStage(opportunity.pipelineStageName)
    : opportunity?.pipelineStageId
    ? getCategoryForIssueStage(opportunity.pipelineStageId)
    : null;

  if (mappedCategory && !tags.includes(mappedCategory)) {
    tags.push(mappedCategory);
  }

  // Safe subject: opportunity name or fallback
  const subject = opportunity?.name || null;

  // Dates
  const openedAt = conversation.dateAdded
    ? new Date(conversation.dateAdded)
    : conversation.lastMessageDate
    ? new Date(conversation.lastMessageDate)
    : null;

  const sourceUpdatedAt = conversation.dateUpdated
    ? new Date(conversation.dateUpdated)
    : conversation.lastMessageDate
    ? new Date(conversation.lastMessageDate)
    : null;

  // Never invent resolved date. If opportunity is in a resolved stage and has updatedAt, use it.
  const resolvedAt = opportunity?.updatedAt ? new Date(opportunity.updatedAt) : null;

  const loc = locationId || conversation.locationId;
  const sourceUrl = loc
    ? `https://app.gohighlevel.com/v2/location/${loc}/conversations/conversations/${conversation.id}`
    : null;

  return {
    externalId,
    externalNumber: externalNumber ? String(externalNumber) : null,
    subject,
    tags,
    status: opportunity?.pipelineStageName || null,
    sourceUrl,
    openedAt,
    sourceUpdatedAt,
    resolvedAt,
    topic: mappedCategory || null,
  };
}

/**
 * Normalizes raw GHL messages into generic HistoricalConversationMessage format in-memory.
 * Filters out automated activity/system notices and assigns roles.
 */
export function normalizeGhlMessages(messages: GHLMessage[]): HistoricalConversationMessage[] {
  const result: HistoricalConversationMessage[] = [];

  for (const m of messages) {
    const rawText = (m.body || m.text || "").trim();
    if (!rawText) continue;

    // Filter out common automated notification boilerplate
    if (rawText.includes("HubSpot Logo") || rawText.includes("ROUTE NEW MESSAGES AUTOMATICALLY")) {
      continue;
    }

    // Exclude GHL system/activity events (e.g. TYPE_ACTIVITY_OPPORTUNITY, TYPE_ACTIVITY_APPOINTMENT)
    if (
      (typeof m.messageType === "string" && m.messageType.startsWith("TYPE_ACTIVITY_")) ||
      rawText.startsWith("Opportunity created") ||
      rawText.startsWith("Opportunity updated")
    ) {
      continue;
    }

    let role: "CUSTOMER" | "AGENT" | "INTERNAL" | "SYSTEM" = "CUSTOMER";

    if (m.direction === "inbound") {
      role = "CUSTOMER";
    } else if (m.direction === "outbound") {
      role = "AGENT";
    } else if (m.messageType === "INTERNAL_NOTE" || m.contentType === "note") {
      role = "INTERNAL";
    } else {
      role = "SYSTEM";
    }

    let timestamp: Date | undefined;
    if (m.dateAdded) {
      timestamp = new Date(m.dateAdded);
    } else if (m.createdAt) {
      timestamp = new Date(m.createdAt);
    }

    result.push({
      role,
      text: rawText,
      timestamp,
    });
  }

  // Ensure chronological order
  return result.sort((a, b) => {
    const timeA = a.timestamp ? a.timestamp.getTime() : 0;
    const timeB = b.timestamp ? b.timestamp.getTime() : 0;
    return timeA - timeB;
  });
}
