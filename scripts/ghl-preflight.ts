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
  const headers = {
    "Authorization": `Bearer ${TOKEN}`,
    "Version": API_VERSION,
    "Accept": "application/json"
  };

  try {
    const searchUrl = `${API_URL}/conversations/search?locationId=${LOCATION_ID}&limit=5`;
    const res = await fetch(searchUrl, { headers });
    const searchData = await res.json();
    const convs = searchData.conversations || [];
    
    if (convs.length > 0) {
      for (const conv of convs) {
        const msgRes = await fetch(`${API_URL}/conversations/${conv.id}/messages`, { headers });
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          const messages = msgData.messages?.messages || msgData.messages || msgData.data || [];
          console.log(`MsgData keys:`, Object.keys(msgData), 'messages array len:', messages.length);
          if (messages.length > 0) {
            console.log(`\n=== Message Schema (from conv ${conv.id}) ===`);
            console.log(JSON.stringify(messages[0], null, 2).replace(LOCATION_ID!, "HIDDEN_LOCATION").substring(0, 1500));
            break;
          }
        }
      }
    }

    // Try Message Export Endpoint with limit=10
    console.log("\n=== Checking Message Export Endpoint ===");
    const exportUrl = `${API_URL}/conversations/messages/export?locationId=${LOCATION_ID}&limit=10`;
    const exportRes = await fetch(exportUrl, { headers });
    if (exportRes.ok) {
        const exData = await exportRes.json();
        console.log("✅ Message Export Fetch Successful!");
        console.log("Keys:", Object.keys(exData));
    } else {
        console.log(`❌ Export error: ${exportRes.status} ${await exportRes.text()}`);
    }

  } catch (err: any) {
    console.error("❌ Execution Error:", err.message);
  }
}

main().catch(console.error);
