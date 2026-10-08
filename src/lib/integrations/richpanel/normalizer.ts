import { RichpanelTicket } from './types';

export function normalizeRichpanelTicket(ticket: RichpanelTicket) {
  return {
    externalId: ticket.id || (ticket.conversation_no != null ? String(ticket.conversation_no) : "unknown"),
    externalNumber: ticket.conversation_no != null ? String(ticket.conversation_no) : null,
    subject: ticket.subject || null,
    tags: ticket.tags || [],
    sourceUrl: ticket.url || null,
    openedAt: new Date(ticket.created_at),
    sourceUpdatedAt: new Date(ticket.updated_at),
    closedAt: ticket.closed_at ? new Date(ticket.closed_at) : new Date(ticket.updated_at),
  };
}
