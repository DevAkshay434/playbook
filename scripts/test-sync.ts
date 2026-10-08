import * as fs from "fs";
import * as path from "path";

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

import { runRichpanelSync } from "../src/lib/integrations/richpanel/sync";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Running First Sync...");
  const res1 = await runRichpanelSync({ limit: 10 });
  console.log("First Sync Result:", res1);

  console.log("\nRunning Second Sync...");
  const res2 = await runRichpanelSync({ limit: 10 });
  console.log("Second Sync Result:", res2);

  // Check for duplicates
  const totalCases = await prisma.historicalSupportCase.count({
    where: { source: "RICHPANEL" }
  });
  console.log(`\nTotal RICHPANEL cases in DB: ${totalCases}`);

  process.exit(0);
}

main().catch(e => {
  console.error("Test failed", e);
  process.exit(1);
});
