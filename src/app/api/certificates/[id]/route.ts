import { NextResponse } from "next/server";
import { getCertificateById } from "@/lib/data/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const certId = decodeURIComponent(id);

  const cert = getCertificateById(certId);
  if (!cert) {
    return NextResponse.json({ ok: false, error: "Certificate not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, certificate: cert });
}
