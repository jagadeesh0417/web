import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { getDb } from "@/lib/db/mongodb";
import { MongoServerError } from "mongodb";

type RateBucket = { _id: string; count: number; expiresAt: Date };

// Vercel documents x-forwarded-for as platform-overwritten. Do not apply this
// trust assumption to other hosts or an Enterprise custom trusted proxy.
export function clientIp(request: Request): string | null {
  if (process.env.VERCEL === "1") {
    const ip = request.headers.get("x-forwarded-for")?.trim() ?? "";
    return isIP(ip) ? ip : null;
  }
  return process.env.NODE_ENV === "production" ? null : "127.0.0.1";
}

export async function allowRequest(scope: string, ip: string, limit: number, now = Date.now()): Promise<boolean> {
  const windowMs = 10 * 60 * 1000;
  const window = Math.floor(now / windowMs);
  const hash = createHash("sha256").update(ip).digest("hex");
  const buckets = (await getDb()).collection<RateBucket>("internshipApplicationRateLimits");
  const id = `${scope}:${hash}:${window}`;
  let result;
  try {
    result = await buckets.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * windowMs) } },
      { upsert: true, returnDocument: "after" },
    );
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
    result = await buckets.findOneAndUpdate({ _id: id }, { $inc: { count: 1 } }, { returnDocument: "after" });
  }
  return !!result && result.count <= limit;
}
