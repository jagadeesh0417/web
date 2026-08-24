"use client";

import type { LeadFormType, LeadFields, LeadSubmitResult } from "@/lib/leads/types";

export interface SubmitLeadOptions {
  formType: LeadFormType;
  source: string;
  page?: string;
  pagePath?: string;
  fields: LeadFields;
  /** Honeypot value — leave empty */
  website?: string;
  language?: string;
  signal?: AbortSignal;
}

function detectDevice(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) return "mobile";
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  return "desktop";
}

function readUtm(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  if (typeof window === "undefined") return {};
  try {
    const sp = new URLSearchParams(window.location.search);
    return {
      utmSource: sp.get("utm_source") ?? undefined,
      utmMedium: sp.get("utm_medium") ?? undefined,
      utmCampaign: sp.get("utm_campaign") ?? undefined,
    };
  } catch {
    return {};
  }
}

function sanitizeFields(fields: LeadFields): LeadFields {
  const out: LeadFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    if (typeof v === "string") {
      const t = v.trim();
      if (t.length > 5000) out[k] = t.slice(0, 5000);
      else out[k] = t;
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Central client helper — every public / support form should call this.
 * Posts to /api/leads (server stores lead + attempts WhatsApp Cloud API).
 */
export async function submitLead(options: SubmitLeadOptions): Promise<LeadSubmitResult> {
  const pagePath =
    options.pagePath ??
    (typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/");

  const utm = readUtm();
  const idempotencyKey =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `k_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const body = {
    formType: options.formType,
    source: options.source,
    page: options.page ?? options.source,
    pagePath,
    fields: sanitizeFields(options.fields),
    website: options.website ?? "",
    language: options.language ?? (typeof navigator !== "undefined" ? navigator.language : "en"),
    deviceType: detectDevice(),
    idempotencyKey,
    ...utm,
  };

  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    const data = (await res.json().catch(() => ({}))) as LeadSubmitResult & {
      error?: string;
      message?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: data.error || data.message || "Something went wrong. Please try again.",
      };
    }

    return {
      ok: true,
      leadId: data.leadId,
      whatsappStatus: data.whatsappStatus,
      message: data.message,
    };
  } catch {
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/** Fetch leads for admin UI (requires admin session cookie in demo, open API in demo mode). */
export async function fetchLeadsAdmin(): Promise<{ ok: boolean; leads: import("@/lib/leads/types").WebsiteLead[] }> {
  try {
    const res = await fetch("/api/leads", { method: "GET", cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      leads?: import("@/lib/leads/types").WebsiteLead[];
    };
    if (!res.ok) return { ok: false, leads: [] };
    return { ok: true, leads: data.leads ?? [] };
  } catch {
    return { ok: false, leads: [] };
  }
}
