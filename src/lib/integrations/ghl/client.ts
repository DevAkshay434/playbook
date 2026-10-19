import { GHLPipeline, GHLOpportunity, GHLConversation, GHLMessage } from "./types";

function getGhlConfig() {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  const locationId = process.env.GHL_LOCATION_ID;
  const apiUrl = process.env.GHL_API_URL || "https://services.leadconnectorhq.com";
  const apiVersion = process.env.GHL_API_VERSION || "2021-07-28";

  if (!token) {
    throw new Error("Missing GHL_PRIVATE_INTEGRATION_TOKEN in environment");
  }
  if (!locationId) {
    throw new Error("Missing GHL_LOCATION_ID in environment");
  }

  return { token, locationId, apiUrl, apiVersion };
}

function getHeaders() {
  const { token, apiVersion } = getGhlConfig();
  return {
    Authorization: `Bearer ${token}`,
    Version: apiVersion,
    Accept: "application/json",
  };
}

/**
 * Fetch all pipelines and stages for the configured location.
 */
export async function fetchGhlPipelines(): Promise<GHLPipeline[]> {
  const { apiUrl, locationId } = getGhlConfig();
  const res = await fetch(`${apiUrl}/opportunities/pipelines?locationId=${locationId}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GHL Pipelines API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.pipelines || [];
}

/**
 * Search opportunities for the configured location.
 */
export async function fetchGhlOpportunities(params: {
  pipelineId?: string;
  stageId?: string;
  contactId?: string;
  limit?: number;
  dateUpdated?: string;
} = {}): Promise<{ opportunities: GHLOpportunity[]; total?: number }> {
  const { apiUrl, locationId } = getGhlConfig();
  const url = new URL(`${apiUrl}/opportunities/search`);
  url.searchParams.set("location_id", locationId);
  if (params.pipelineId) url.searchParams.set("pipeline_id", params.pipelineId);
  if (params.stageId) url.searchParams.set("pipeline_stage_id", params.stageId);
  if (params.contactId) url.searchParams.set("contact_id", params.contactId);
  if (params.limit) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GHL Opportunities API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    opportunities: data.opportunities || [],
    total: data.total,
  };
}

/**
 * Fetch a single opportunity by ID.
 * Returns null if not found (404).
 */
export async function fetchGhlOpportunity(opportunityId: string): Promise<GHLOpportunity | null> {
  const { apiUrl } = getGhlConfig();
  const res = await fetch(`${apiUrl}/opportunities/${opportunityId}`, {
    headers: getHeaders(),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GHL Get Opportunity error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.opportunity || null;
}

/**
 * Search conversations for the configured location.
 */
export async function fetchGhlConversations(params: {
  limit?: number;
  contactId?: string;
  lastMessageDate?: number;
  startAfterDate?: number;
} = {}): Promise<{ conversations: GHLConversation[]; total?: number }> {
  const { apiUrl, locationId } = getGhlConfig();
  const url = new URL(`${apiUrl}/conversations/search`);
  url.searchParams.set("locationId", locationId);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.contactId) url.searchParams.set("contactId", params.contactId);
  if (params.lastMessageDate) url.searchParams.set("lastMessageDate", String(params.lastMessageDate));
  if (params.startAfterDate) url.searchParams.set("startAfterDate", String(params.startAfterDate));

  const res = await fetch(url.toString(), {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GHL Conversations API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    conversations: data.conversations || [],
    total: data.total,
  };
}

/**
 * Fetch messages for a specific conversation.
 * Raw message text is strictly processed in memory and never stored in the database.
 */
export async function fetchGhlConversationMessages(conversationId: string): Promise<GHLMessage[]> {
  const { apiUrl } = getGhlConfig();
  const res = await fetch(`${apiUrl}/conversations/${conversationId}/messages`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GHL Conversation Messages error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const messages = data.messages?.messages || data.messages || data.data || [];
  return messages;
}
