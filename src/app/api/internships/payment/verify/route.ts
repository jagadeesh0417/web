import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { PROGRAM_BY_SLUG } from "@/lib/constants";
import { createEnrollment } from "@/lib/data/repository";
import { emailTemplates, sendWorkflowEmail } from "@/lib/notifications";
import { submitLead } from "@/lib/leads/client";

const bodySchema = z.object({
  applicationId: z.string().min(1),
  paymentMethod: z.string().optional(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadApplications(): Promise<Record<string, Record<string, unknown>>> {
  try {
    const fs = await import("fs");
    const storePath = `${process.cwd()}/data/internship-applications.json`;
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, "utf-8"));
    }
  } catch {
    // ignore
  }
  return {};
}

async function saveApplications(apps: Record<string, Record<string, unknown>>): Promise<void> {
  try {
    const fs = await import("fs");
    const dir = `${process.cwd()}/data`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${process.cwd()}/data/internship-applications.json`, JSON.stringify(apps, null, 2));
  } catch {
    // ignore
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    const { applicationId, paymentMethod } = parsed.data;
    const apps = await loadApplications();
    const app = apps[applicationId] as Record<string, unknown> | undefined;

    if (!app) {
      return NextResponse.json({ ok: false, error: "Application not found." }, { status: 404 });
    }

    if (app.status !== "payment_processing") {
      return NextResponse.json({ ok: false, error: "Application is not in payment processing state." }, { status: 400 });
    }

    const programSlug = app.programSlug as string;
    const duration = app.duration as number;
    const categorySlug = app.categorySlug as string;
    const student = app.student as Record<string, string>;
    const programTitle = app.programTitle as string;

    const program = PROGRAM_BY_SLUG[programSlug as keyof typeof PROGRAM_BY_SLUG];
    if (!program) {
      return NextResponse.json({ ok: false, error: "Program not found." }, { status: 404 });
    }

    const serverAmount = Math.round(
      program.price * (duration / program.durationWeeks) * (duration === 8 ? 0.95 : 1),
    );

    // In demo mode: payment is auto-verified
    // In production: verify with Razorpay/Stripe signature here

    let created;
    try {
      created = createEnrollment({
        userId: `pending:${student.email}`,
        categorySlug,
        programSlug,
        programTitle,
        durationWeeks: duration,
        price: serverAmount,
        clientName: student.fullName,
        email: student.email,
        method: (paymentMethod === "card" || paymentMethod === "netbanking" || paymentMethod === "wallet" ? paymentMethod : "upi") as "upi" | "card" | "netbanking" | "wallet",
      });
    } catch {
      return NextResponse.json({ ok: false, error: "Failed to create enrollment." }, { status: 500 });
    }

    app.status = "payment_success";
    app.enrollmentId = created.enrollment.enrollmentId;
    app.studentId = created.enrollment.studentId;
    app.invoiceNumber = created.enrollment.invoiceNumber;
    app.paymentVerifiedAt = new Date().toISOString();
    apps[applicationId] = app;
    await saveApplications(apps);

    // WhatsApp lead notification
    try {
      await submitLead({
        formType: "internship_application",
        source: `Internship Application — ${categorySlug}`,
        page: "Internship Application",
        pagePath: "/internships/apply",
        fields: {
          fullName: student.fullName,
          email: student.email,
          phone: student.mobile,
          mobile: student.mobile,
          college: student.college,
          course: student.course,
          category: categorySlug,
          program: programSlug,
          internship: programTitle,
          duration: `${duration} weeks`,
          amount: serverAmount,
          paymentMethod: paymentMethod ?? "upi",
          applicationId,
          enrollmentId: created.enrollment.enrollmentId,
          studentId: created.enrollment.studentId,
          invoiceNumber: created.enrollment.invoiceNumber,
          paymentStatus: "Successful",
        },
      });
    } catch {
      // WhatsApp failure should not block enrollment
    }

    // Email notifications
    const origin = typeof request.headers.get("origin") === "string"
      ? request.headers.get("origin")!
      : "http://localhost:3000";

    try {
      const t = emailTemplates();
      const start = created.enrollment.startedAt.slice(0, 10);
      const end = new Date(new Date(start).getTime() + duration * 7 * 86400000).toISOString().slice(0, 10);

      await sendWorkflowEmail({
        to: student.email,
        subject: `Payment successful — ${programTitle}`,
        template: "payment_confirmation",
        html: t.paymentConfirmation(student.fullName, {
          programTitle,
          amount: serverAmount,
          orderId: app.paymentOrderId as string,
          invoiceNumber: created.enrollment.invoiceNumber,
          enrollmentId: created.enrollment.enrollmentId,
          studentId: created.enrollment.studentId,
        }),
      });

      await sendWorkflowEmail({
        to: student.email,
        subject: "Your internship offer letter",
        template: "offer_letter",
        html: t.offerLetter(student.fullName, {
          programTitle,
          durationWeeks: duration,
          startDate: start,
          endDate: end,
          studentId: created.enrollment.studentId,
        }),
      });

      await sendWorkflowEmail({
        to: student.email,
        subject: "Welcome to Akradhii",
        template: "welcome",
        html: t.welcome(student.fullName, {
          programTitle,
          dashboardUrl: `${origin}/login`,
        }),
      });
    } catch {
      // Email failure should not block enrollment
    }

    return NextResponse.json({
      ok: true,
      enrollmentId: created.enrollment.enrollmentId,
      studentId: created.enrollment.studentId,
      invoiceNumber: created.enrollment.invoiceNumber,
      applicationId,
      orderId: app.paymentOrderId,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
}
