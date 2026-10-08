import * as assert from "node:assert";
import { normalizeRichpanelTicket } from "../src/lib/integrations/richpanel/normalizer";
import { RichpanelTicket } from "../src/lib/integrations/richpanel/types";

function runTests() {
  console.log("Running normalization tests...");

  // 1. conversation_no: 1005 (number) -> externalNumber: "1005"
  const t1 = {
    id: "uuid-1",
    conversation_no: 1005,
    created_at: "2026-10-01T12:00:00Z",
    updated_at: "2026-10-01T12:00:00Z",
    status: "CLOSED",
    is_trashed: false,
  } as RichpanelTicket;

  const res1 = normalizeRichpanelTicket(t1);
  assert.strictEqual(res1.externalNumber, "1005", "Number should be cast to string");
  assert.strictEqual(res1.externalId, "uuid-1");

  // 2. conversation_no: "1005" (string) -> externalNumber: "1005"
  const t2 = {
    id: "uuid-2",
    conversation_no: "1005",
    created_at: "2026-10-01T12:00:00Z",
    updated_at: "2026-10-01T12:00:00Z",
    status: "CLOSED",
    is_trashed: false,
  } as RichpanelTicket;

  const res2 = normalizeRichpanelTicket(t2);
  assert.strictEqual(res2.externalNumber, "1005", "String should remain string");

  // 3. conversation_no: null -> externalNumber: null
  const t3 = {
    id: "uuid-3",
    conversation_no: null,
    created_at: "2026-10-01T12:00:00Z",
    updated_at: "2026-10-01T12:00:00Z",
    status: "CLOSED",
    is_trashed: false,
  } as RichpanelTicket;

  const res3 = normalizeRichpanelTicket(t3);
  assert.strictEqual(res3.externalNumber, null, "Null should remain null");

  // 4. conversation_no: undefined -> externalNumber: null
  const t4 = {
    id: "uuid-4",
    created_at: "2026-10-01T12:00:00Z",
    updated_at: "2026-10-01T12:00:00Z",
    status: "CLOSED",
    is_trashed: false,
  } as RichpanelTicket;

  const res4 = normalizeRichpanelTicket(t4);
  assert.strictEqual(res4.externalNumber, null, "Undefined should become null");

  console.log("✅ All normalization tests passed!");
}

try {
  runTests();
} catch (err: any) {
  console.error("Test failed:", err.message);
  process.exit(1);
}
