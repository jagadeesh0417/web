import { promises as fs } from "fs";
import path from "path";
import type { WebsiteLead, WhatsAppDeliveryStatus } from "@/lib/leads/types";

const MAX_LEADS = 5000;
const FILE_NAME = "leads.json";

function storagePaths(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, "data", FILE_NAME),
    path.join("/tmp", "akradhii-leads.json"),
  ];
}

/** Process-lifetime cache (shared across warm serverless invocations). */
let memory: WebsiteLead[] | null = null;
const idempotency = new Map<string, string>();

async function readFromDisk(): Promise<WebsiteLead[]> {
  for (const file of storagePaths()) {
    try {
      const raw = await fs.readFile(file, "utf8");
      const parsed = JSON.parse(raw) as WebsiteLead[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* try next */
    }
  }
  return [];
}

async function writeToDisk(leads: WebsiteLead[]): Promise<void> {
  const payload = JSON.stringify(leads.slice(0, MAX_LEADS), null, 2);
  for (const file of storagePaths()) {
    try {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, payload, "utf8");
      return;
    } catch {
      /* try next path */
    }
  }
}

async function ensureLoaded(): Promise<WebsiteLead[]> {
  if (memory) return memory;
  memory = await readFromDisk();
  return memory;
}

export async function listLeads(): Promise<WebsiteLead[]> {
  const leads = await ensureLoaded();
  return [...leads].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

export async function getLeadById(id: string): Promise<WebsiteLead | undefined> {
  const leads = await ensureLoaded();
  return leads.find((l) => l.id === id);
}

export async function getLeadByIdempotencyKey(key: string): Promise<WebsiteLead | undefined> {
  const id = idempotency.get(key);
  if (!id) return undefined;
  return getLeadById(id);
}

export async function saveLead(lead: WebsiteLead, idempotencyKey?: string): Promise<WebsiteLead> {
  const leads = await ensureLoaded();
  leads.unshift(lead);
  if (leads.length > MAX_LEADS) leads.length = MAX_LEADS;
  memory = leads;
  if (idempotencyKey) idempotency.set(idempotencyKey, lead.id);
  await writeToDisk(leads);
  return lead;
}

export async function updateLeadWhatsApp(
  id: string,
  patch: {
    whatsappStatus: WhatsAppDeliveryStatus;
    whatsappMessageId?: string;
    whatsappError?: string;
  },
): Promise<WebsiteLead | undefined> {
  const leads = await ensureLoaded();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return undefined;
  leads[idx] = { ...leads[idx]!, ...patch };
  memory = leads;
  await writeToDisk(leads);
  return leads[idx];
}

/** Lightweight in-memory rate limit: max N posts per IP per window. */
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
