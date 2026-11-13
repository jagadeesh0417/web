import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { CATEGORY_BY_SLUG, PROGRAM_BY_SLUG } from "@/lib/constants";
import { randomId } from "@/lib/utils";
import { applicationSchema } from "@/lib/validators";
import { createHash } from "node:crypto";
import { saveApplication } from "@/lib/internships/application-store";
import { allowRequest, clientIp } from "@/lib/rate-limit";
import { submitApplication } from "@/lib/internships/application-service";
import { applicationErrorKey } from "@/lib/internships/application-errors";

const bodySchema = applicationSchema.extend({
  confirmEmail: z.string().trim().email().max(254),
  referralCode: z.string().trim().max(100).optional(),
  website: z.string().max(0).optional(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    if (!ip) return NextResponse.json({ ok: false, error: "Application service is unavailable." }, { status: 503 });
    const allowed = await allowRequest("apply", ip, 8);
    if (!allowed) return NextResponse.json({ ok: false, error: "Too many attempts. Please try again later." }, { status: 429 });
    const key = request.headers.get("idempotency-key") ?? "";
    if (!/^[a-f0-9-]{36}$/i.test(key)) return NextResponse.json({ ok: false, error: "A valid idempotency key is required." }, { status: 400 });
    const body = await request.text();
    if (Buffer.byteLength(body, "utf8") > 32_000) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413 });
    let json: unknown;
    try { json = JSON.parse(body); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = applicationErrorKey(String(issue.path[0] ?? ""));
        if (key && !errors[key]) errors[key] = issue.message;
      }
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    const data = parsed.data;

    if (data.email.toLowerCase() !== data.confirmEmail.toLowerCase()) {
      return NextResponse.json({ ok: false, errors: { confirmEmail: "Email addresses do not match." } }, { status: 400 });
    }

    const category = CATEGORY_BY_SLUG[data.category as keyof typeof CATEGORY_BY_SLUG];
    if (!category) {
      return NextResponse.json({ ok: false, errors: { category: "Internship category not found." } }, { status: 404 });
    }

    const program = PROGRAM_BY_SLUG[data.program as keyof typeof PROGRAM_BY_SLUG];
    if (!program) {
      return NextResponse.json({ ok: false, errors: { program: "Program not found." } }, { status: 404 });
    }

    if (data.duration !== Number.parseInt(program.duration, 10)) {
      return NextResponse.json({ ok: false, errors: { program: "Duration does not match the selected plan." } }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const applicationId = `INT-${year}-${randomId(8).toUpperCase()}`;
    const orderId = `ORD-${year}-${randomId(8).toUpperCase()}`;

    const amount = program.price;

    const application = {
      id: applicationId,
      orderId,
      status: "pending_payment" as const,
      categorySlug: data.category,
      categoryTitle: category.name,
      programSlug: data.program,
      programTitle: `${category.name} — ${program.title}`,
      duration: data.duration,
      amount,
      currency: "INR",
      student: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        mobile: data.mobile,
        dob: data.dob,
        gender: data.gender,
        college: data.college,
        course: data.course,
        branch: data.branch,
        graduationYear: data.graduationYear,
        city: data.city,
        state: data.state,
        linkedin: data.linkedin,
        github: data.github,
      },
      referralCode: data.referralCode || undefined,
      consent: { acceptedAt: new Date().toISOString(), version: "terms-privacy-v1" },
      createdAt: new Date().toISOString(),
    };
    const fingerprint = createHash("sha256").update(JSON.stringify(parsed.data)).digest("hex");
    const result = await submitApplication({ rateLimit: async () => allowed, save: () => saveApplication(key, fingerprint, application) });
    if (result.status !== 200 || !result.application) {
      return NextResponse.json({ ok: false, error: result.status === 409 ? "This submission key was already used for different details." : "Application storage is unavailable. Please contact support." }, { status: result.status });
    }
    const saved = result.application;

    return NextResponse.json({
      ok: true,
      applicationId: saved.id,
      orderId: saved.orderId,
      amount: saved.amount,
      currency: "INR",
      programTitle: saved.programTitle,
      categoryTitle: saved.categoryTitle,
      duration: saved.duration,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Application service is unavailable. Please contact support." }, { status: 503 });
  }
}
