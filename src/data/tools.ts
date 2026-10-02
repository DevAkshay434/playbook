export interface Tool {
  name: string;
  role: string;
  note: string;
}

export const tools: Tool[] = [
  {
    "name": "Richpanel",
    "role": "Helpdesk",
    "note": "Support tickets and email. Every resolution gets logged here."
  },
  {
    "name": "GHL",
    "role": "CRM",
    "note": "Contacts, pipelines, campaigns. Customer history lives here when it predates Richpanel."
  },
  {
    "name": "Consio",
    "role": "Phone",
    "note": "Calls, call history, agent availability."
  },
  {
    "name": "Shopify",
    "role": "Orders & payments",
    "note": "Orders, refunds, disputes. Refunds are blocked on any order with an open chargeback."
  },
  {
    "name": "WordPress knowledge base",
    "role": "Customer-facing articles",
    "note": "Public how-to and troubleshooting articles."
  },
  {
    "name": "Canature WaterGroup",
    "role": "Manufacturer / warehouse",
    "note": "Builds and ships the units. Parts, RGAs and warranty claims route through them."
  },
  {
    "name": "UPS",
    "role": "Carrier",
    "note": "Current freight carrier (moved off FedEx). Ground only."
  }
];
