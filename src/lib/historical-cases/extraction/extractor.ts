import { HistoricalConversationInput, ExtractionResult } from "./types";
import { extractWithOpenAI, OPENAI_EXTRACTION_VERSION } from "./providers/openai";
import { sanitizeText } from "./sanitize";

export const EXTRACTION_VERSION = OPENAI_EXTRACTION_VERSION;

/**
 * Extracts structured support data from a raw conversation using the configured provider.
 */
export async function extractHistoricalCase(input: HistoricalConversationInput): Promise<ExtractionResult> {
  // We use the OpenAI provider directly as requested
  const result = await extractWithOpenAI(input);

  // POST-EXTRACTION QUALITY & PII VALIDATION
  
  // 1. PII check
  // We strictly check if the provider leaked the exact PII placeholders back without context, 
  // or check if obvious new PII somehow leaked (though it shouldn't if input was sanitized).
  // A simple heuristic: run sanitizer on the output. If it changes, PII was present!
  const combinedOutput = [
    result.issueSummary,
    result.symptoms,
    result.troubleshooting,
    result.finalResolution
  ].filter(Boolean).join(" ");
  
  const sanitizedOutput = sanitizeText(combinedOutput);
  if (sanitizedOutput !== combinedOutput) {
    throw new Error("Extracted content failed privacy validation.");
  }

  // 2. Schema Quality
  if (result.usableAsHistoricalCase && !result.issueSummary) {
    throw new Error("Validation failed: Usable case missing issueSummary.");
  }
  
  if (result.usableAsHistoricalCase && !result.finalResolution) {
    throw new Error("Validation failed: Usable case missing finalResolution.");
  }
  
  if (result.confidence < 0 || result.confidence > 100) {
    throw new Error("Validation failed: Confidence out of bounds.");
  }

  return result;
}
