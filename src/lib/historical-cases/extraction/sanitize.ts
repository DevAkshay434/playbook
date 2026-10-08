import { HistoricalConversationInput } from "./types";

export function sanitizeConversation(input: HistoricalConversationInput): HistoricalConversationInput {
  const profile = input.customerProfile;
  
  return {
    ...input,
    subject: input.subject ? sanitizeText(input.subject, profile) : null,
    messages: input.messages.map(m => ({
      ...m,
      text: sanitizeText(m.text, profile)
    }))
  };
}

export function sanitizeText(text: string, profile?: { name?: string | null; email?: string | null; phone?: string | null }): string {
  let sanitized = text;

  // 1. Deterministic replacement of known customer profile data first
  if (profile) {
    if (profile.name && profile.name.length > 2) {
      // Escape for regex
      const nameRegex = new RegExp(profile.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
      sanitized = sanitized.replace(nameRegex, "[CUSTOMER]");
      
      // Also check first name / last name independently if space separated
      const parts = profile.name.split(/\s+/);
      if (parts.length > 1) {
        for (const part of parts) {
          if (part.length > 2) {
            const partRegex = new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
            sanitized = sanitized.replace(partRegex, "[CUSTOMER_NAME]");
          }
        }
      }
    }
    
    if (profile.email && profile.email.length > 3) {
      const emailRegex = new RegExp(profile.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
      sanitized = sanitized.replace(emailRegex, "[EMAIL]");
    }

    if (profile.phone && profile.phone.length > 5) {
      // Very basic stripping to match varying formats
      const digits = profile.phone.replace(/\D/g, '');
      if (digits.length >= 7) {
        // Just look for the digits sequence in the string
        // Actually, it's safer to just replace the exact raw profile.phone string
        const phoneRegex = new RegExp(profile.phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
        sanitized = sanitized.replace(phoneRegex, "[PHONE]");
      }
    }
  }

  // 2. Generic regexes for PII
  // Replace Emails
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]");
  
  // Replace Phones (very basic US/Intl matching)
  sanitized = sanitized.replace(/(\+\d{1,2}\s?)?1?-?\.?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, "[PHONE]");

  return sanitized;
}
