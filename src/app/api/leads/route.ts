import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { generateId } from "@/lib/utils";
import { emailSchema } from "@/lib/validators";
import { buildWhatsAppMessage, extractPrimaryFields } from "@/lib/leads/format";
import { isValidPhone, normalizePhone, formatPhoneDisplay } from "@/lib/leads/phone";
import {
  checkRateLimit,
  getLeadByIdempotencyKey,
  hashIp,
  listLeads,
  saveLead,
  updateLeadWhatsApp,
} from "@/lib/leads/store";
import { sendWhatsAppText } from "@/lib/leads/whatsapp";
import type { LeadFormType, WebsiteLead, LeadFields } from "@/lib/leads/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 48_000;

const formTypes = [
  "contact",
  "internship_application",
  "service_enquiry",
  "consultation",
  "callback",
  "support",
  "other",
] as const;

const leadBodySchema = z.object({
  formType: z.enum(formTypes),
  source: z.string().trim().min(1).max(200),
  page: z.string().trim().max(200).optional(),
  pagePath: z.string().trim().max(500).optional(),
  fields: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
  website: z.string().max(200).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
  language: z.string().max(32).optional(),
  deviceType: z.string().max(32).optional(),
  idempotencyKey: z.string().max(80).optional(),
});

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function sanitizeString(value: unknown, max = 2000): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, max);
}

function sanitizeFields(raw: Record<string, string | number | boolean | null>): LeadFields {
  const out: LeadFields = {};
  const keys = Object.keys(raw).slice(0, 40);
  for (const key of keys) {
    const safeKey = key.replace(/[^\w.-]/g, "").slice(0, 64);
    if (!safeKey || safeKey === "password" || safeKey === "token") continue;
    const val = raw[key];
    if (typeof val === "boolean" || typeof val === "number") {
      out[safeKey] = val;
    } else if (val === null) {
      out[safeKey] = null;
    } else {
      out[safeKey] = sanitizeString(val, 4000);
    }
  }
  return out;
}

function requireContactBasics(formType: LeadFormType, fields: LeadFields): string | null {
  const primary = extractPrimaryFields(fields);
  if (!primary.name || primary.name.length < 2) return "Please enter your name.";
  if (primary.email) {
    const emailCheck = emailSchema.safeParse(primary.email);
    if (!emailCheck.success) return "Please enter a valid email address.";
  } else if (formType !== "callback") {
    return "Please enter a valid email address.";
  }
  if (primary.phone) {
    if (!isValidPhone(primary.phone)) {
      return "Please enter a valid phone number.";
    }
  } else if (formType === "internship_application" || formType === "callback") {
    return "Please enter a valid phone number.";
  }
  return null;
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  let rawText: string;
  try {
    rawText = await request.text();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (rawText.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Payload too large." }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawText);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = leadBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form and try again." },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Honeypot — bots fill hidden "website" field
  if (data.website && data.website.trim() !== "") {
    return NextResponse.json({
      ok: true,
      leadId: generateId("lead"),
      whatsappStatus: "skipped",
      message: "Message sent successfully",
    });
  }

  const idemKey =
    data.idempotencyKey ||
    request.headers.get("x-idempotency-key") ||
    undefined;

  if (idemKey) {
    const existing = await getLeadByIdempotencyKey(idemKey);
    if (existing) {
      return NextResponse.json({
        ok: true,
        leadId: existing.id,
        whatsappStatus: existing.whatsappStatus,
        message: "Message sent successfully",
      });
    }
  }

  const fields = sanitizeFields(data.fields);
  const validationError = requireContactBasics(data.formType, fields);
  if (validationError) {
    return NextResponse.json({ ok: false, error: validationError }, { status: 400 });
  }

  const primary = extractPrimaryFields(fields);
  if (primary.phone) {
    const normalized = normalizePhone(primary.phone);
    fields.phone = formatPhoneDisplay(primary.phone);
    if (fields.mobile) fields.mobile = formatPhoneDisplay(String(fields.mobile));
    // keep normalized for internal use without exposing as separate field noise
    fields._phoneE164 = normalized;
  }

  const now = new Date().toISOString();
  const lead: WebsiteLead = {
    id: generateId("lead"),
    formType: data.formType,
    source: sanitizeString(data.source, 200),
    page: sanitizeString(data.page || data.source, 200),
    pagePath: sanitizeString(data.pagePath || "", 500),
    name: primary.name,
    email: primary.email,
    phone: primary.phone ? formatPhoneDisplay(primary.phone) : "",
    company: primary.company,
    service: primary.service,
    internship: primary.internship,
    course: primary.course,
    duration: primary.duration
      ? String(primary.duration).includes("week")
        ? String(primary.duration)
        : `${primary.duration} weeks`
      : undefined,
    message: primary.message,
    fields,
    submittedAt: now,
    whatsappStatus: "pending",
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    language: data.language,
    deviceType: data.deviceType,
    ipHash: hashIp(ip),
    userAgent: sanitizeString(request.headers.get("user-agent") || "", 300),
  };

  // Layer 1 — always persist first so WhatsApp failure never loses the lead
  try {
    await saveLead(lead, idemKey);
  } catch (err) {
    console.error("[leads] storage failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  // Layer 2 — WhatsApp notification (best effort)
  const message = buildWhatsAppMessage(lead);
  const wa = await sendWhatsAppText(message);
  await updateLeadWhatsApp(lead.id, {
    whatsappStatus: wa.status,
    whatsappMessageId: wa.messageId,
    whatsappError: wa.error,
  });

  const successMessage =
    data.formType === "internship_application"
      ? "Application submitted successfully"
      : "Message sent successfully";

  return NextResponse.json({
    ok: true,
    leadId: lead.id,
    whatsappStatus: wa.status,
    message: successMessage,
  });
}

export async function GET(request: NextRequest) {
  // Admin listing — allow when demo session is admin OR ADMIN_LEADS_SECRET header matches
  const secret = process.env.ADMIN_LEADS_SECRET?.trim();
  const headerSecret = request.headers.get("x-admin-secret")?.trim();
  const demoCookie = request.cookies.get("ak_demo_session")?.value;
  let isAdmin = false;

  if (secret && headerSecret && secret === headerSecret) isAdmin = true;

  if (demoCookie) {
    try {
      const data = JSON.parse(decodeURIComponent(demoCookie)) as { role?: string };
      if (data.role === "admin" || data.role === "super_admin") isAdmin = true;
    } catch {
      /* ignore */
    }
  }

  // In local/demo without secrets, still allow GET so admin dashboard works in demo mode
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!supabaseConfigured && !secret) isAdmin = true;

  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const leads = await listLeads();
  // Strip internal-only fields before sending to client
  const safe = leads.map((l) => {
    const { ipHash: _i, userAgent: _u, ...rest } = l;
    const fields = { ...rest.fields };
    delete fields._phoneE164;
    return { ...rest, fields };
  });

  return NextResponse.json({ ok: true, leads: safe });
}
