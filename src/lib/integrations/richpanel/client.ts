import { RichpanelSearchResponse, RichpanelTicket } from './types';

function getHeaders() {
  const API_KEY = process.env.RICHPANEL_API_KEY;
  const API_URL = process.env.RICHPANEL_API_URL || "https://api.richpanel.com/v1/";
  
  if (!API_KEY) {
    throw new Error("Missing RICHPANEL_API_KEY");
  }
  return {
    "x-richpanel-key": API_KEY,
    "Content-Type": "application/json"
  };
}

export async function fetchClosedTickets(limit: number = 30, nextUrl?: string | null): Promise<RichpanelSearchResponse> {
  const API_URL = process.env.RICHPANEL_API_URL || "https://api.richpanel.com/v1/";
  const url = nextUrl || `${API_URL}tickets?status=CLOSED`;
  const res = await fetch(url, { headers: getHeaders() });
  
  if (!res.ok) {
    throw new Error(`Richpanel API Error: ${res.status} ${await res.text()}`);
  }
  
  return await res.json() as RichpanelSearchResponse;
}

export async function fetchTicket(id: string): Promise<RichpanelTicket> {
  const API_URL = process.env.RICHPANEL_API_URL || "https://api.richpanel.com/v1/";
  const res = await fetch(`${API_URL}tickets/${id}`, { headers: getHeaders() });
  
  if (!res.ok) {
    throw new Error(`Richpanel API Error: ${res.status} ${await res.text()}`);
  }
  
  const data = await res.json();
  return data.ticket || data;
}
