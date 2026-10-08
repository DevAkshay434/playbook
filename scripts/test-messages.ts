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
  
  // First get a ticket that likely has messages (e.g. status OPEN or CLOSED but not empty)
  // Let's just pick one from the list API.
  const res = await tryFetch(`${API_URL}tickets`, headers);
  if (!res.success) return console.log("Failed to fetch tickets", res);
  
  let targetTicketId = null;
  const tickets = res.data.ticket || [];
  for (const t of tickets) {
      if (t.last_message_sender_type === "operator" || t.last_message_sender_type === "customer") {
          targetTicketId = t.id || t.conversation_no;
          break;
      }
  }
  
  if (!targetTicketId) targetTicketId = tickets[0]?.id || tickets[0]?.conversation_no;
  if (!targetTicketId) return console.log("No tickets found.");
  
  console.log(`Testing with Ticket ID: ${targetTicketId}`);
  
  // 1. Check messages endpoint
  const r1 = await tryFetch(`${API_URL}tickets/${targetTicketId}/messages`, headers);
  console.log(`\n--- /tickets/{id}/messages ---`);
  console.log("Status:", r1.status);
  if (r1.success) console.log("Keys:", Object.keys(r1.data));
  else console.log("Body:", r1.body);
  
  // 2. Check comments endpoint
  const r2 = await tryFetch(`${API_URL}tickets/${targetTicketId}/comments`, headers);
  console.log(`\n--- /tickets/{id}/comments ---`);
  console.log("Status:", r2.status);
  if (r2.success) console.log("Keys:", Object.keys(r2.data));
  else console.log("Body:", r2.body);

  // 3. Check base tickets endpoint with include=comments
  const r3 = await tryFetch(`${API_URL}tickets/${targetTicketId}?include=comments,messages`, headers);
  console.log(`\n--- /tickets/{id}?include=comments,messages ---`);
  console.log("Status:", r3.status);
  if (r3.success) {
      const singleTick = r3.data.ticket || r3.data;
      console.log("Ticket keys:", Object.keys(singleTick));
      if (singleTick.comments) console.log("Comments length:", singleTick.comments.length);
      if (singleTick.messages) console.log("Messages length:", singleTick.messages.length);
  }
  
  // 4. Check base messages endpoint
  const r4 = await tryFetch(`${API_URL}messages?ticketId=${targetTicketId}`, headers);
  console.log(`\n--- /messages?ticketId={id} ---`);
  console.log("Status:", r4.status);
  if (r4.success) console.log("Keys:", Object.keys(r4.data));
  else console.log("Body:", r4.body);
}

main();
