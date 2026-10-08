import OpenAI from "openai";
import { ExtractionResult, HistoricalConversationInput } from "../types";
import { sanitizeConversation } from "../sanitize";

export const OPENAI_EXTRACTION_VERSION = "1.0.0-openai";

export async function extractWithOpenAI(input: HistoricalConversationInput): Promise<ExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"; // fallback to a known model if not provided

  if (!apiKey) {
    throw new Error("Missing AI Provider Configuration. Please provide OPENAI_API_KEY.");
  }

  const openai = new OpenAI({ apiKey });

  // 1. Sanitize
  const sanitized = sanitizeConversation(input);

  // 2. Build and trim conversation
  let conversationText = `Source: ${sanitized.source}\nSubject: ${sanitized.subject || "N/A"}\nTags: ${(sanitized.tags || []).join(", ")}\n\nConversation:\n`;
  
  // Trimming strategy: Limit to first 10 and last 10 messages to save tokens and focus on issue & resolution
  let messagesToInclude = sanitized.messages;
  const MAX_MESSAGES = 20;
  if (messagesToInclude.length > MAX_MESSAGES) {
    const firstPart = messagesToInclude.slice(0, 10);
    const lastPart = messagesToInclude.slice(messagesToInclude.length - 10);
    messagesToInclude = [...firstPart, { role: "SYSTEM", text: "... [TRUNCATED FOR LENGTH] ..." }, ...lastPart];
  }

  for (const msg of messagesToInclude) {
    const timestampStr = msg.timestamp ? ` [${new Date(msg.timestamp).toISOString()}]` : '';
    // Cap individual message length to prevent absurdly long payloads
    let text = msg.text || "";
    if (text.length > 2000) {
      text = text.substring(0, 2000) + "... [TRUNCATED]";
    }
    conversationText += `${msg.role}${timestampStr}:\n${text}\n\n`;
  }

  // 3. System Prompt
  const systemPrompt = `You are extracting structured support knowledge from a historical support conversation.
Use only facts contained in the supplied conversation.

Do not invent:
- symptoms
- troubleshooting
- root causes
- products
- final resolutions

A suggested action is NOT automatically a confirmed resolution.
Only populate finalResolution when the conversation provides reasonable evidence that the issue was actually resolved or the final outcome is known.

Do not include:
- customer names
- email addresses
- phone numbers
- addresses
- account identifiers
- unnecessary order/customer IDs

Preserve:
- product/model names
- error codes
- technical terminology
- measurements
- actual troubleshooting actions

Historical cases are reference examples, NOT official SOPs.

Note on Internal Notes: Distinguish agent speculation from confirmed final outcomes. Do not convert an internal guess into a confirmed resolution unless evidence supports it.
If CLOSED but no supported final resolution exists:
finalResolution = null
usableAsHistoricalCase = false
`;

  // 4. API Call
  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: conversationText }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "historical_case_extraction",
        schema: {
          type: "object",
          properties: {
            issueSummary: { type: ["string", "null"] },
            symptoms: { type: ["string", "null"] },
            troubleshooting: { type: ["string", "null"] },
            finalResolution: { type: ["string", "null"] },
            topic: { type: ["string", "null"] },
            confidence: { type: "number", description: "0 to 1" },
            evidenceQuality: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
            usableAsHistoricalCase: { type: "boolean" }
          },
          required: [
            "issueSummary", "symptoms", "troubleshooting", "finalResolution", 
            "topic", "confidence", "evidenceQuality", "usableAsHistoricalCase"
          ],
          additionalProperties: false
        },
        strict: true
      }
    },
    temperature: 0.1
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Received empty response from OpenAI.");
  }

  const result = JSON.parse(content);
  
  // 5. Post-validation & mapping
  // Map confidence (0-1) to 0-100 for our DB schema
  const dbConfidence = Math.round(Math.min(Math.max(result.confidence, 0), 1) * 100);

  return {
    issueSummary: result.issueSummary,
    symptoms: result.symptoms,
    troubleshooting: result.troubleshooting,
    finalResolution: result.finalResolution,
    topic: result.topic,
    confidence: dbConfidence,
    evidenceQuality: result.evidenceQuality,
    usableAsHistoricalCase: result.usableAsHistoricalCase
  };
}
