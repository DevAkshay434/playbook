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

const API_KEY = process.env.RICHPANEL_API_KEY;
const CLIENT_ID = process.env.RICHPANEL_APP_CLIENT_ID;
const API_URL = process.env.RICHPANEL_API_URL || "https://api.richpanel.com/v1/";

async function main() {
  console.log("=== RICHPANEL API PREFLIGHT ===");
  if (!API_KEY) {
    console.error("❌ ERROR: RICHPANEL_API_KEY is missing in .env.local");
    process.exit(1);
  }
  console.log("✅ API Key found (hidden)");

  if (!CLIENT_ID) {
    console.error("❌ ERROR: RICHPANEL_APP_CLIENT_ID is missing");
    process.exit(1);
  }
  console.log(`✅ App Client ID: ${CLIENT_ID}`);
  console.log(`✅ API URL: ${API_URL}`);

  console.log("\n--- Testing Authentication ---");
  try {
    const listUrl = `${API_URL}tickets?appClientId=${CLIENT_ID}&limit=5`;
    const headers = {
      "x-richpanel-key": API_KEY,
      "Content-Type": "application/json"
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
