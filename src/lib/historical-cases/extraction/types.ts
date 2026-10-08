export type HistoricalConversationRole = "CUSTOMER" | "AGENT" | "INTERNAL" | "SYSTEM";

export interface HistoricalConversationMessage {
  role: HistoricalConversationRole;
  text: string;
  timestamp?: Date;
}

export interface HistoricalConversationInput {
  source: string;
  externalId: string;
  subject?: string | null;
  openedAt?: Date | null;
  resolvedAt?: Date | null;
  tags?: string[];
  customerProfile?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  messages: HistoricalConversationMessage[];
}

export interface ExtractionResult {
  issueSummary: string | null;
  symptoms: string | null;
  troubleshooting: string | null;
  finalResolution: string | null;
  topic: string | null;
  confidence: number; // 0-100
  evidenceQuality: "HIGH" | "MEDIUM" | "LOW";
  usableAsHistoricalCase: boolean;
}
