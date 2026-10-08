import * as fs from "fs";
import * as path from "path";

// 1. Load env
function loadEnv(filePath: string) {
  if (fs.existsSync(filePath)) {
    const envConfig = fs.readFileSync(filePath, 'utf8');
    envConfig.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.replace(/^"|"$/g, '');
        }
        process.env[key] = value;
      }
    });
  }
}
loadEnv(path.resolve(process.cwd(), ".env"));
loadEnv(path.resolve(process.cwd(), ".env.local"));

import { prisma } from "../src/lib/prisma";
import { fetchTicket } from "../src/lib/integrations/richpanel/client";
import { extractHistoricalCase, EXTRACTION_VERSION } from "../src/lib/historical-cases/extraction/extractor";

async function runControlledTest() {
  const cases = await prisma.historicalSupportCase.findMany({
    where: { extractionStatus: "NOT_PROCESSED", source: "RICHPANEL" },
    take: 5
  });

  console.log(`Found ${cases.length} NOT_PROCESSED cases.`);

  for (let i = 0; i < cases.length; i++) {
    const supportCase = cases[i];
    console.log(`\n--- Case ${i + 1} (${supportCase.id}) ---`);
    
    // Set processing
    await prisma.historicalSupportCase.update({
      where: { id: supportCase.id },
      data: { extractionStatus: "PROCESSING", reviewStatus: "PENDING" }
    });

    try {
      const ticket = await fetchTicket(supportCase.externalId);
      const tagsArray = Array.isArray(supportCase.tags) ? supportCase.tags as string[] : [];
      
      const input = {
        source: "RICHPANEL",
        externalId: supportCase.externalId,
        subject: supportCase.subject,
        tags: tagsArray,
        openedAt: supportCase.openedAt,
        resolvedAt: supportCase.resolvedAt,
        messages: (ticket.comments || []).map((c: any) => ({
          role: (c.sender_type === "contact" ? "CUSTOMER" : (!c.public ? "INTERNAL" : "AGENT")) as "CUSTOMER" | "AGENT" | "INTERNAL" | "SYSTEM",
          text: c.plain_body || c.body || "",
          timestamp: new Date(c.created_at)
        })).filter((m: any) => m.text)
      };

      console.log(`[Extracted Ticket] Thread length: ${input.messages.length} messages.`);
      
      const result = await extractHistoricalCase(input);

      console.log(`Extraction success: YES`);
      console.log(`Issue summary quality: ${result.issueSummary ? "Meaningful (" + result.issueSummary.substring(0, 50) + "...)" : "None"}`);
      console.log(`Symptoms quality: ${result.symptoms ? "Meaningful" : "None"}`);
      console.log(`Troubleshooting quality: ${result.troubleshooting ? "Meaningful" : "None"}`);
      console.log(`Final resolution quality: ${result.finalResolution ? "Clear" : "None"}`);
      console.log(`Topic quality: ${result.topic ? "Useful (" + result.topic + ")" : "None"}`);
      console.log(`Confidence: ${result.confidence}%`);
      console.log(`Evidence quality: ${result.evidenceQuality}`);
      console.log(`Usable: ${result.usableAsHistoricalCase}`);

      await prisma.historicalSupportCase.update({
        where: { id: supportCase.id },
        data: {
          extractionStatus: "READY",
          issueText: result.issueSummary,
          symptoms: result.symptoms,
          troubleshooting: result.troubleshooting,
          resolutionText: result.finalResolution,
          topic: result.topic,
          confidence: result.confidence,
          evidenceQuality: result.evidenceQuality,
          usableAsHistoricalCase: result.usableAsHistoricalCase,
          extractedAt: new Date(),
          extractionVersion: EXTRACTION_VERSION
        }
      });
      
    } catch (err: any) {
      console.error(`Extraction success: Failed (${err.message})`);
      await prisma.historicalSupportCase.update({
        where: { id: supportCase.id },
        data: { extractionStatus: "FAILED" }
      });
    }
  }

  console.log("\nDone evaluating 5 cases.");
  process.exit(0);
}

runControlledTest().catch(console.error);
