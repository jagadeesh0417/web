export type LeadFormType =
  | "contact"
  | "internship_application"
  | "service_enquiry"
  | "consultation"
  | "callback"
  | "support"
  | "other";

export type WhatsAppDeliveryStatus = "pending" | "sent" | "failed" | "skipped";

/** Dynamic field bag — every form field the user filled. */
export type LeadFields = Record<string, string | number | boolean | null | undefined>;

export interface LeadInput {
  formType: LeadFormType;
  source: string;
  page?: string;
  pagePath?: string;
  fields: LeadFields;
  /** Honeypot — must be empty for humans */
  website?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  language?: string;
  deviceType?: string;
  idempotencyKey?: string;
}

export interface WebsiteLead {
  id: string;
  formType: LeadFormType;
  source: string;
  page: string;
  pagePath: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  service?: string;
  internship?: string;
  course?: string;
  duration?: string;
  message?: string;
  fields: LeadFields;
  submittedAt: string;
  whatsappStatus: WhatsAppDeliveryStatus;
  whatsappMessageId?: string;
  whatsappError?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  language?: string;
  deviceType?: string;
  ipHash?: string;
  userAgent?: string;
}

export interface LeadSubmitResult {
  ok: boolean;
  leadId?: string;
  whatsappStatus?: WhatsAppDeliveryStatus;
  message?: string;
  error?: string;
}
