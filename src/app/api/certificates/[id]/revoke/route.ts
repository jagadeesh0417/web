import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getCertificateById, revokeCertificate } from "@/lib/data/repository";
import { auditLog } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const certId = decodeURIComponent(id);

  const cert = getCertificateById(certId);
  if (!cert) {
    return NextResponse.json({ ok: false, error: "Certificate not found" }, { status: 404 });
  }

  if (cert.status === "revoked") {
    return NextResponse.json({ ok: false, error: "Certificate is already revoked" }, { status: 400 });
  }

  let reason: string | undefined;
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (parsed.success) reason = parsed.data.reason;
  } catch {
    // No body or invalid JSON — that's fine
  }

  const revoked = revokeCertificate(certId, reason);
  if (!revoked) {
    return NextResponse.json({ ok: false, error: "Failed to revoke certificate" }, { status: 500 });
  }

  auditLog("revoke", "certificate", `Revoked ${certId}${reason ? `: ${reason}` : ""}`, undefined, certId);

  return NextResponse.json({ ok: true, certificate: revoked });
}
