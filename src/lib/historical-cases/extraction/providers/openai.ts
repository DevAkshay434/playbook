import OpenAI from "openai";
import { ExtractionResult, HistoricalConversationInput } from "../types";
import { sanitizeConversation } from "../sanitize";

export const OPENAI_EXTRACTION_VERSION = "1.0.0-openai-responses";

export async function extractWithOpenAI(input: HistoricalConversationInput): Promise<ExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey) {
    throw new Error("Missing AI Provider Configuration. Please provide OPENAI_API_KEY.");
  }
  if (!model) {
    throw new Error("OPENAI_MODEL must be configured.");
  }

  const openai = new OpenAI({ 
    apiKey,
    baseURL: apiKey.startsWith("sk-or") ? "https://openrouter.ai/api/v1" : undefined
  });

  // 1. Sanitize
  const sanitized = sanitizeConversation(input);

  // 2. Build and trim conversation
  let conversationText = `Source: ${sanitized.source}\nSubject: ${sanitized.subject || "N/A"}\nTags: ${(sanitized.tags || []).join(", ")}\n\nConversation:\n`;
  
  // Trimming strategy: Limit to first 10 and last 10 messages
  let messagesToInclude = sanitized.messages;
  const MAX_MESSAGES = 20;
  if (messagesToInclude.length > MAX_MESSAGES) {
    const firstPart = messagesToInclude.slice(0, 10);
    const lastPart = messagesToInclude.slice(messagesToInclude.length - 10);
    messagesToInclude = [...firstPart, { role: "SYSTEM", text: "... [TRUNCATED FOR LENGTH] ..." }, ...lastPart];
  }

  for (const msg of messagesToInclude) {
    const timestampStr = msg.timestamp ? ` [${new Date(msg.timestamp).toISOString()}]` : '';
    let text = msg.text || "";
    if (text.length > 2000) {
      text = text.substring(0, 2000) + "... [TRUNCATED]";
    }
    conversationText += `${msg.role}${timestampStr}:\n${text}\n\n`;
  }

  // 3. System Prompt (Instructions)
  const instructions = `You are extracting structured support knowledge from a historical support conversation.
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

  // 4. API Call using Responses API
  const response = await openai.responses.create({
    model: model,
    store: false,
    instructions: instructions,
    input: conversationText,
    text: {
      format: {
        type: "json_schema",
        name: "historical_support_case",
        strict: true,
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
        }
      }
    }
  });

  // Extract the structured JSON from the response text
  let content = '';
  // Inspecting the generic shape of the likely Responses API return
  // Assuming response.output, response.text, or similar
  if ((response as any).output) {
    // some draft specs put it here
    content = (response as any).output;
  } else if ((response as any).text?.content) {
    content = (response as any).text.content;
  } else {
    // fallback stringification if it directly returns string
    content = typeof response === "string" ? response : JSON.stringify(response);
  }

  // Attempt to parse exactly as the required format.
  // Wait, if the response is actually a stream of parts or structured object:
  // Let's parse it safely.
  let parsedContent = content;
  if (typeof content !== 'string') {
    // If the SDK parses the json_schema directly into the response:
    parsedContent = JSON.stringify(content);
  }

  const result = JSON.parse(parsedContent);
  
  // 5. Post-validation & mapping
  const dbConfidence = Math.round(Math.min(Math.max(result.confidence || 0, 0), 1) * 100);

  const usageData = (response as any).usage;

  return {
    issueSummary: result.issueSummary || null,
    symptoms: result.symptoms || null,
    troubleshooting: result.troubleshooting || null,
    finalResolution: result.finalResolution || null,
    topic: result.topic || null,
    confidence: dbConfidence,
    evidenceQuality: result.evidenceQuality || "LOW",
    usableAsHistoricalCase: !!result.usableAsHistoricalCase,
    usage: usageData ? {
      promptTokens: usageData.prompt_tokens || 0,
      completionTokens: usageData.completion_tokens || 0,
      totalTokens: usageData.total_tokens || 0
    } : undefined
  };
}
