import { NextResponse } from "next/server";
import { getCertificateById } from "@/lib/data/repository";
import { generateCertificatePdf } from "@/lib/certificate/pdf-generator";
import { companySettingsStore } from "@/lib/data/server-store";

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

  const company = companySettingsStore.get() ?? {
    id: "company_default",
    companyName: "Akradhii",
    companyTagline: "Digital Growth Studio",
    logoUrl: "",
    websiteUrl: "https://akradhii.vercel.app",
    udyamNumber: "UDYAM-TS-19-0012345",
    msmeInfo: "MSME Registered Enterprise",
    address: "HITEC City, Hyderabad, Telangana 500081, India",
    authorizedSignatoryName: "Akradhii",
    authorizedSignatoryDesignation: "Director",
    certificatePrefix: "AKR",
    supportEmail: "support@akradhii.com",
    phone: "+91 98485 79053",
    updatedAt: new Date().toISOString(),
  };

  try {
    const pdfBytes = await generateCertificatePdf(cert, company);

    const safeName = cert.studentName.replace(/[^a-zA-Z0-9]/g, "_");
    const safeCourse = cert.categoryName.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${safeName}-${safeCourse}-Certificate.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
