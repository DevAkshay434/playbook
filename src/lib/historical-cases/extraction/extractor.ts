import { HistoricalConversationInput, ExtractionResult } from "./types";
import { sanitizeConversation } from "./sanitize";

export const EXTRACTION_VERSION = "1.0.0";

/**
 * Extracts structured support data from a raw conversation.
 * NOTE: Currently throws because no AI Provider is configured in the environment.
 */
export async function extractHistoricalCase(input: HistoricalConversationInput): Promise<ExtractionResult> {
  // 1. Sanitize the input to strip obvious PII (emails, phones)
  const sanitized = sanitizeConversation(input);

  // 2. Format the thread for the LLM
  let conversationText = `Subject: ${sanitized.subject || "N/A"}\n\n`;
  for (const msg of sanitized.messages) {
    conversationText += `[${msg.role}] ${msg.timestamp ? msg.timestamp.toISOString() : ''}:\n${msg.text}\n\n`;
  }

  const prompt = `
You are a technical support analyst reviewing a historical customer support interaction.
Analyze the following conversation and extract structured data.

Rules:
- Issue Summary: A short description of the actual customer problem.
- Symptoms: Observable symptoms or reported behavior.
- Troubleshooting: Steps attempted by the customer or support agent.
- Final Resolution: What actually solved/closed the issue. Return null if no clear resolution exists.
- Topic: A useful support classification (e.g. "Hardware", "Billing").
- Confidence: 0-100 score of how clearly the conversation supports this extraction.
- Evidence Quality: "HIGH", "MEDIUM", or "LOW".
- Usable: True if the case has a meaningful problem and resolution. False if it's spam, abandoned, or lacks a resolution.

Conversation:
${conversationText}
  `.trim();

  // 3. STOP. AI Provider architecture goes here.
  // We do not have `openai` or `@ai-sdk/openai` installed.
  const AI_PROVIDER_KEY = process.env.OPENAI_API_KEY;
  if (!AI_PROVIDER_KEY) {
    throw new Error("Missing AI Provider Configuration. Please provide OPENAI_API_KEY in .env.local and install the ai-sdk.");
  }

  // 4. (Future) Vercel AI SDK execution:
  /*
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: ExtractionResultSchema,
    prompt: prompt
  });
  return object;
  */

  throw new Error("Extraction architecture implemented, but awaiting AI provider SDK installation.");
}
