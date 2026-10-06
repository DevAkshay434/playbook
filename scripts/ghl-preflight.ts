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

const TOKEN = process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
const LOCATION_ID = process.env.GHL_LOCATION_ID;
const API_URL = process.env.GHL_API_URL || "https://services.leadconnectorhq.com";
const API_VERSION = process.env.GHL_API_VERSION || "2021-07-28";

async function main() {
  console.log("=== GHL API PREFLIGHT ===");
  if (!TOKEN) {
    console.error("❌ ERROR: GHL_PRIVATE_INTEGRATION_TOKEN is missing in .env.local");
    process.exit(1);
  }
  console.log("✅ API Token found (hidden)");

  if (!LOCATION_ID) {
    console.error("❌ ERROR: GHL_LOCATION_ID is missing.");
    console.log("Without GHL_LOCATION_ID, conversation search cannot be scoped properly.");
    process.exit(1);
  }
  console.log(`✅ Location ID: ${LOCATION_ID}`);
  console.log(`✅ API URL: ${API_URL}`);
  console.log(`✅ API Version: ${API_VERSION}`);

  console.log("\n--- Testing Authentication & Fetching Conversations ---");
  try {
    const listUrl = `${API_URL}/conversations/search?locationId=${LOCATION_ID}&limit=5`;
    const headers = {
      "Authorization": `Bearer ${TOKEN}`,
      "Version": API_VERSION,
      "Accept": "application/json"
    };

    console.log(`[GET] ${listUrl}`);
    const res = await fetch(listUrl, { headers });

    if (!res.ok) {
      console.error(`❌ HTTP Error: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.error("Response:", text);
      return;
    }

    const data = await res.json();
    console.log("✅ Connection Successful!\n");
    console.log(JSON.stringify(data, null, 2).substring(0, 3000));
  } catch (err: any) {
    console.error("❌ Network or Execution Error:", err.message);
  }
}

main().catch(console.error);
