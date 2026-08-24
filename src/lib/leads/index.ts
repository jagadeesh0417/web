/** Public lead module surface — safe for client imports (no WhatsApp secrets). */

export type {
  LeadFormType,
  LeadFields,
  LeadInput,
  WebsiteLead,
  LeadSubmitResult,
  WhatsAppDeliveryStatus,
} from "@/lib/leads/types";

export { submitLead, fetchLeadsAdmin } from "@/lib/leads/client";
export { buildWhatsAppMessage, extractPrimaryFields } from "@/lib/leads/format";
export { normalizePhone, isValidPhone, formatPhoneDisplay } from "@/lib/leads/phone";

/** Business inbox (digits only). Safe constant — not a secret. */
export const WHATSAPP_LEAD_NUMBER = "919848579053";
