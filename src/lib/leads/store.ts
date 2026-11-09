import { createHash } from "node:crypto";
import { MongoServerError } from "mongodb";
import { getDb } from "@/lib/db";
import type { WebsiteLead, WhatsAppDeliveryStatus } from "@/lib/leads/types";

// MongoDB's unique _id makes idempotency atomic across instances. Do not fall
// back to local memory or an ephemeral filesystem when the database is down.
type StoredLead = { _id: string; lead: WebsiteLead };
async function collection() {
  return (await getDb()).collection<StoredLead>("websiteLeads");
}
function keyForIdempotency(key: string): string {
  return `request:${createHash("sha256").update(key).digest("hex")}`;
}

export async function listLeads(): Promise<WebsiteLead[]> {
  const records = await (await collection()).find({}).sort({ "lead.submittedAt": -1 }).toArray();
  return records.map((record) => record.lead);
}

export async function getLeadById(id: string): Promise<WebsiteLead | undefined> {
  return (await (await collection()).findOne({ "lead.id": id }))?.lead;
}

export async function getLeadByIdempotencyKey(key: string): Promise<WebsiteLead | undefined> {
  return (await (await collection()).findOne({ _id: keyForIdempotency(key) }))?.lead;
}

export async function saveLead(lead: WebsiteLead, idempotencyKey?: string): Promise<{ lead: WebsiteLead; created: boolean }> {
  const records = await collection();
  const _id = idempotencyKey ? keyForIdempotency(idempotencyKey) : `lead:${lead.id}`;
  try {
    await records.insertOne({ _id, lead });
    return { lead, created: true };
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000 && idempotencyKey) {
      const existing = await records.findOne({ _id });
      if (existing) return { lead: existing.lead, created: false };
    }
    throw error;
  }
}

export async function updateLeadWhatsApp(id: string, patch: {
  whatsappStatus: WhatsAppDeliveryStatus;
  whatsappMessageId?: string;
  whatsappError?: string;
}): Promise<WebsiteLead | undefined> {
  const records = await collection();
  await records.updateOne({ "lead.id": id }, { $set: {
    "lead.whatsappStatus": patch.whatsappStatus,
    "lead.whatsappMessageId": patch.whatsappMessageId,
    "lead.whatsappError": patch.whatsappError,
  } });
  return (await records.findOne({ "lead.id": id }))?.lead;
}

/** Best-effort local limit; a shared distributed limiter is still required. */
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
export function checkRateLimit(ip: string, limit = 8, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function hashIp(ip: string): string {
  let h = 0;
  for (let i = 0; i < ip.length; i++) h = (Math.imul(31, h) + ip.charCodeAt(i)) | 0;
  return `ip_${(h >>> 0).toString(16)}`;
}
