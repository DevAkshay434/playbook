export interface GHLStage {
  id: string;
  name: string;
  position?: number;
}

export interface GHLPipeline {
  id: string;
  name: string;
  stages: GHLStage[];
}

export interface GHLOpportunity {
  id: string;
  name?: string;
  pipelineId: string;
  pipelineStageId: string;
  pipelineName?: string;
  pipelineStageName?: string;
  status?: string; // e.g. "open", "won", "lost", "abandoned" (never used for resolution)
  contactId?: string;
  monetaryValue?: number;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GHLConversation {
  id: string;
  contactId?: string;
  locationId?: string;
  lastMessageDate?: number;
  dateUpdated?: number;
  dateAdded?: number;
  unreadCount?: number;
  tags?: string[];
  type?: string;
  lastMessageType?: string;
  lastMessageBody?: string;
  isLastMessageInternalComment?: boolean;
}

export interface GHLMessage {
  id: string;
  conversationId?: string;
  direction?: "inbound" | "outbound" | string;
  body?: string;
  text?: string;
  dateAdded?: string | number;
  createdAt?: string;
  messageType?: string;
  contentType?: string;
  source?: string;
  status?: string;
}

export interface GHLContactProfile {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}
