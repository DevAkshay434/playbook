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
const API_URL = process.env.RICHPANEL_API_URL || "https://api.richpanel.com/v1/";

async function tryFetch(url: string, headers: any) {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
        return { success: false, status: res.status, body: await res.text() };
    }
    const data = await res.json();
    return { success: true, status: 200, data };
  } catch (err: any) {
    return { success: false, status: 500, error: err.message };
  }
}

async function main() {
  const headers = { "x-richpanel-key": API_KEY, "Content-Type": "application/json" };
  
  // Try with cursor/pagination to fetch up to 100 tickets to see if ANY have comments
  let url = `${API_URL}tickets`;
  let checked = 0;
  let found = 0;
  
  while (url && checked < 100) {
      const res = await tryFetch(url, headers);
      if (!res.success) break;
      
      const tickets = res.data.ticket || [];
      if (tickets.length === 0) break;
      
      for (const t of tickets) {
          checked++;
          if (t.comments && t.comments.length > 0) {
              console.log(`\n🎉 Found comments in Ticket ID: ${t.id} (No. ${t.conversation_no})`);
              console.log(`Subject: ${t.subject}`);
              console.log(`Comments count: ${t.comments.length}`);
              console.log(`First comment type: ${t.comments[0].type}`);
              found++;
              if (found >= 2) return;
          }
      }
      
      url = res.data.next_page;
  }
  
  if (found === 0) {
      console.log(`\n❌ Checked ${checked} tickets. ALL of them had 0 comments.`);
  }
}

main();
