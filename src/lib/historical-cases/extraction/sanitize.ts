import { HistoricalConversationInput } from "./types";

export function sanitizeConversation(input: HistoricalConversationInput): HistoricalConversationInput {
  return {
    ...input,
    subject: input.subject ? sanitizeText(input.subject) : null,
    messages: input.messages.map(m => ({
      ...m,
      text: sanitizeText(m.text)
    }))
  };
}

export function sanitizeText(text: string): string {
  let sanitized = text;

  // Extremely naive regexes for PII (in a real production app, this would be more robust)
  // Replace Emails
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]");
  
  // Replace Phones (very basic US/Intl matching)
  sanitized = sanitized.replace(/(\+\d{1,2}\s?)?1?-?\.?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, "[PHONE]");

  // We could also do address/name removal here if we had robust NER.
  // For now, this baseline prevents raw phone/email leaks to the AI.
  
  return sanitized;
}
