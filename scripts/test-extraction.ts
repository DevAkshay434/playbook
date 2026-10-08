import * as assert from "node:assert";
import { sanitizeText, sanitizeConversation } from "../src/lib/historical-cases/extraction/sanitize";
import { HistoricalConversationInput, ExtractionResult } from "../src/lib/historical-cases/extraction/types";
import { extractHistoricalCase } from "../src/lib/historical-cases/extraction/extractor";

async function runTests() {
  console.log("Running Extraction & Sanitizer tests...");

  // 1. PII Sanitizer Test
  const rawText = "Hello, my email is jane.doe@example.com and phone is 555-123-4567. Please ship to 123 Main St.";
  const sanitized = sanitizeText(rawText);
  assert.ok(sanitized.includes("[EMAIL]"), "Email should be redacted");
  assert.ok(sanitized.includes("[PHONE]"), "Phone should be redacted");
  assert.ok(!sanitized.includes("jane.doe@example.com"), "Raw email should be removed");
  assert.ok(!sanitized.includes("555-123-4567"), "Raw phone should be removed");

  const conversation: HistoricalConversationInput = {
    source: "RICHPANEL",
    externalId: "test-123",
    subject: "My email is test@test.com",
    messages: [
      { role: "CUSTOMER", text: "Call me at 800-555-0199" }
    ]
  };

  const cleanConv = sanitizeConversation(conversation);
  assert.strictEqual(cleanConv.subject, "My email is [EMAIL]");
  assert.strictEqual(cleanConv.messages[0].text, "Call me at [PHONE]");

  // 2. Extractor Test (Missing Provider gracefully fails)
  try {
    await extractHistoricalCase(cleanConv);
    assert.fail("Should throw missing AI provider error");
  } catch (err: any) {
    assert.ok(err.message.includes("Missing AI Provider Configuration"), "Must enforce AI configuration check");
  }

  console.log("✅ All extraction tests passed!");
}

try {
  runTests();
} catch (err: any) {
  console.error("Test failed:", err.message);
  process.exit(1);
}
