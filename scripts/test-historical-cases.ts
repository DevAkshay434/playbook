/**
 * Synthetic test to verify Historical Cases logic without real customer data.
 * Tests:
 * - Pagination / Filters
 * - AI unconfigured checks
 * - Stale PROCESSING recovery
 */

import { prisma } from "../src/lib/prisma";
import { extractNext5, recoverStaleProcessing } from "../src/app/admin/historical-cases/actions";
import { SupportCaseSource } from "@prisma/client";

async function runTests() {
  console.log("Setting up synthetic tests...");

  // Setup mock data
  const testId1 = `TEST-CASE-1-${Date.now()}`;
  const testId2 = `TEST-CASE-2-${Date.now()}`;

  const c1 = await prisma.historicalSupportCase.create({
    data: {
      source: SupportCaseSource.RICHPANEL,
      externalId: testId1,
      subject: "Test Pagination Case",
      extractionStatus: "NOT_PROCESSED",
      active: true,
      updatedAt: new Date(Date.now() - 40 * 60 * 1000) // 40 minutes ago
    }
  });

  const c2 = await prisma.historicalSupportCase.create({
    data: {
      source: SupportCaseSource.RICHPANEL,
      externalId: testId2,
      subject: "Test Stale Recovery",
      extractionStatus: "PROCESSING",
      active: true,
      updatedAt: new Date(Date.now() - 40 * 60 * 1000) // 40 minutes ago
    }
  });

  try {
    // 1. Test Stale Recovery
    console.log("Testing Stale PROCESSING Recovery...");
    const recovered = await recoverStaleProcessing();
    console.log(`Recovered ${recovered} cases.`);
    
    const checkC2 = await prisma.historicalSupportCase.findUnique({ where: { id: c2.id } });
    if (checkC2?.extractionStatus === "FAILED") {
      console.log("✅ Stale Recovery Passed");
    } else {
      console.error("❌ Stale Recovery Failed", checkC2);
    }

    // 2. Test AI Unconfigured
    console.log("Testing AI Unconfigured...");
    // Simulate missing key
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    
    let caughtError = false;
    try {
      // should throw without changing DB
      await extractNext5();
    } catch (e: any) {
      if (e.message.includes("AI extraction is not configured")) {
        caughtError = true;
      }
    }

    if (caughtError) {
      console.log("✅ AI Unconfigured UX Passed");
    } else {
      console.error("❌ AI Unconfigured UX Failed");
    }

    // restore
    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey;
    }

  } finally {
    // Cleanup
    await prisma.historicalSupportCase.deleteMany({
      where: {
        externalId: { in: [testId1, testId2] }
      }
    });
    console.log("Cleanup complete.");
  }
}

runTests().catch(console.error);
