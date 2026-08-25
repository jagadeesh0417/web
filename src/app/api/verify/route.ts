import { NextResponse } from "next/server";
import { getCertificateById, logVerifyLookup } from "@/lib/data/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Simple in-memory rate limit for public verification */
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateOk(ip: string, limit = 30, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

export async function GET(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!rateOk(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Try again later." }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const certificateId = (searchParams.get("certificateId") ?? searchParams.get("id") ?? "").trim();

  if (!certificateId) {
    return NextResponse.json({ ok: false, error: "certificateId is required" }, { status: 400 });
  }

  if (certificateId.length > 64 || !/^[A-Za-z0-9_-]+$/.test(certificateId)) {
    return NextResponse.json({ ok: false, error: "Invalid certificate ID format" }, { status: 400 });
  }

  const cert = getCertificateById(certificateId);
  try {
    logVerifyLookup(certificateId, Boolean(cert));
  } catch {
    /* ignore demo log failures on server */
  }

  if (!cert) {
    return NextResponse.json({ ok: false, error: "Certificate not found" }, { status: 404 });
  }

  // Public fields only — no internal student IDs or private notes
  return NextResponse.json({
    ok: true,
    certificate: {
      certificateId: cert.certificateId,
      studentName: cert.studentName,
      categoryName: cert.categoryName,
      programTitle: cert.programTitle,
      durationWeeks: cert.durationWeeks,
      completionDate: cert.endDate,
      issuedAt: cert.issuedAt,
      score: cert.score,
      status: "verified",
      issuedBy: cert.issuedBy,
    },
  });
}
