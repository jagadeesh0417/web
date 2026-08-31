import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getCertificateEligibility,
  getCertificatesByStudent,
  getEnrollmentByUser,
  hasPassedAssessment,
  issueCertificateForUser,
} from "@/lib/data/repository";
import { sendWorkflowEmail, emailTemplates } from "@/lib/notifications";
import { saveLead } from "@/lib/leads/store";
import { sendWhatsAppText } from "@/lib/leads/whatsapp";
import { generateId } from "@/lib/utils";
import type { WebsiteLead } from "@/lib/leads/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 },
      );
    }

    const { userId } = parsed.data;

    if (!hasPassedAssessment(userId)) {
      return NextResponse.json(
        { ok: false, error: "Student has not passed the final assessment." },
        { status: 403 },
      );
    }

    const eligibility = getCertificateEligibility(userId);
    if (!eligibility.eligible) {
      return NextResponse.json(
        { ok: false, error: "Not eligible for certificate.", reasons: eligibility.reasons },
        { status: 403 },
      );
    }

    const existing = getCertificatesByStudent(userId);
    if (existing.length > 0) {
      const cert = existing[0]!;
      return NextResponse.json({ ok: true, certificate: cert, alreadyIssued: true });
    }

    const cert = issueCertificateForUser(userId, "Akradhii");
    if (!cert) {
      return NextResponse.json(
        { ok: false, error: "Failed to issue certificate." },
        { status: 500 },
      );
    }

    const enrollment = getEnrollmentByUser(userId);
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://akradhii.vercel.app"}/verify?cert=${cert.certificateId}`;

    const templates = emailTemplates();
    const emailHtml = templates.certificateIssued(cert.studentName, cert.certificateId, verifyUrl);

    sendWorkflowEmail({
      to: enrollment?.userId ? userId : userId,
      subject: `Your certificate is ready — ${cert.certificateId}`,
      template: "certificateIssued",
      html: emailHtml,
    }).catch(() => {});

    const whatsappLead: WebsiteLead = {
      id: generateId("lead"),
      formType: "other",
      source: "certificate-api",
      page: "Certificate Issued",
      pagePath: "/api/internships/certificate",
      name: cert.studentName,
      email: "",
      phone: "",
      internship: cert.programTitle,
      course: cert.categoryName,
      fields: {
        name: cert.studentName,
        certificateId: cert.certificateId,
        program: cert.programTitle,
        category: cert.categoryName,
        duration: `${cert.durationWeeks} weeks`,
        score: cert.score,
      },
      submittedAt: new Date().toISOString(),
      whatsappStatus: "pending",
    };

    saveLead(whatsappLead)
      .then(async (saved) => {
        const msg = `🎓 Certificate Issued\n\nStudent: ${cert.studentName}\nProgram: ${cert.programTitle}\nCertificate ID: ${cert.certificateId}\nScore: ${cert.score}%\nDuration: ${cert.durationWeeks} weeks\nVerify: ${verifyUrl}`;
        const wa = await sendWhatsAppText(msg);
        const { updateLeadWhatsApp } = await import("@/lib/leads/store");
        await updateLeadWhatsApp(saved.id, {
          whatsappStatus: wa.status,
          whatsappMessageId: wa.messageId,
          whatsappError: wa.error,
        });
      })
      .catch(() => {});

    return NextResponse.json({
      ok: true,
      certificate: {
        id: cert.id,
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        categoryName: cert.categoryName,
        programTitle: cert.programTitle,
        durationWeeks: cert.durationWeeks,
        startDate: cert.startDate,
        endDate: cert.endDate,
        issuedAt: cert.issuedAt,
        score: cert.score,
        issuedBy: cert.issuedBy,
        verifyUrl,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 },
    );
  }
}
