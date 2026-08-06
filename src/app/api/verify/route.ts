import { NextResponse } from "next/server";
import { getCertificateById } from "@/lib/data/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const certificateId = searchParams.get("certificateId") ?? searchParams.get("id") ?? "";

  if (!certificateId) {
    return NextResponse.json({ ok: false, error: "certificateId is required" }, { status: 400 });
  }

  const cert = getCertificateById(certificateId);
  if (!cert) {
    return NextResponse.json(
      { ok: false, error: "Certificate not found", certificateId },
      { status: 404 },
    );
  }

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
