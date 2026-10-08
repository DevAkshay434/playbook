import { prisma } from "../src/lib/prisma";

async function testFilters() {
  const tests = [
    { name: "ALL / ALL / ALL", filters: {} },
    { name: "RICHPANEL / ALL / ALL", filters: { source: "RICHPANEL" } },
    { name: "GHL / ALL / ALL", filters: { source: "GHL" } },
    { name: "ALL / PENDING / ALL", filters: { reviewStatus: "PENDING" } },
    { name: "ALL / APPROVED / ALL", filters: { reviewStatus: "APPROVED" } },
    { name: "ALL / REJECTED / ALL", filters: { reviewStatus: "REJECTED" } },
    { name: "ALL / ALL / NOT_PROCESSED", filters: { extractionStatus: "NOT_PROCESSED" } },
    { name: "ALL / ALL / PROCESSING", filters: { extractionStatus: "PROCESSING" } },
    { name: "ALL / ALL / READY", filters: { extractionStatus: "READY" } },
    { name: "ALL / ALL / FAILED", filters: { extractionStatus: "FAILED" } },
    { name: "RICHPANEL / PENDING / NOT_PROCESSED", filters: { source: "RICHPANEL", reviewStatus: "PENDING", extractionStatus: "NOT_PROCESSED" } },
    { name: "RICHPANEL / PENDING / FAILED", filters: { source: "RICHPANEL", reviewStatus: "PENDING", extractionStatus: "FAILED" } },
  ];

  for (const t of tests) {
    const count = await prisma.historicalSupportCase.count({ where: t.filters as any });
    console.log(`${t.name}: ${count}`);
  }
}

testFilters().catch(console.error).finally(() => process.exit(0));
