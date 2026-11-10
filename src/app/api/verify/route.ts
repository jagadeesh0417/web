import { NextResponse } from "next/server";
import { allowRequest, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const notFound = () => NextResponse.json({ ok: false, error: "Certificate could not be verified." }, { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  const ip = clientIp(request);
  if (!ip) return NextResponse.json({ ok: false, error: "Certificate verification is temporarily unavailable." }, { status: 503 });
  let allowed: boolean;
  try { allowed = await allowRequest("verify", ip, 30); }
  catch { return NextResponse.json({ ok: false, error: "Certificate verification is temporarily unavailable." }, { status: 503 }); }
  // The current repository is demo data, never authoritative in production.
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEMO_CERTIFICATE_LOOKUP !== "true") return NextResponse.json({ ok: false, error: "Certificate verification is temporarily unavailable." }, { status: 503 });
  if (!allowed) return notFound();

  const { searchParams } = new URL(request.url);
  // Support both ?cert= (QR code format) and ?certificateId= (search format)
  const certificateId = (
    searchParams.get("cert") ??
    searchParams.get("certificateId") ??
    searchParams.get("id") ??
    ""
  ).trim();

  if (!certificateId) {
    return notFound();
  }

  if (certificateId.length > 64 || !/^[A-Za-z0-9_-]+$/.test(certificateId)) {
    return notFound();
  }

  const { getCertificateById } = await import("@/lib/data/repository");
  const cert = getCertificateById(certificateId);

  if (!cert) {
    return notFound();
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
      status: cert.status || "valid",
      issuedBy: cert.issuedBy,
    },
  });
}
