import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { CATEGORY_BY_SLUG, PROGRAM_BY_SLUG } from "@/lib/constants";
import { randomId } from "@/lib/utils";
import { applicationSchema } from "@/lib/validators";

const bodySchema = applicationSchema.extend({
  confirmEmail: z.string().trim().email().max(254),
  referralCode: z.string().trim().max(100).optional(),
  website: z.string().max(0).optional(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
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
      return NextResponse.json({ ok: false, errors: { categorySlug: "Internship category not found." } }, { status: 404 });
    }

    const program = PROGRAM_BY_SLUG[data.program as keyof typeof PROGRAM_BY_SLUG];
    if (!program) {
      return NextResponse.json({ ok: false, errors: { programSlug: "Program not found." } }, { status: 404 });
    }

    if (data.duration !== Number.parseInt(program.duration, 10)) {
      return NextResponse.json({ ok: false, errors: { duration: "Duration does not match the selected plan." } }, { status: 400 });
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
      agreementAccepted: data.agree,
      createdAt: new Date().toISOString(),
    };

    const storePath = `${process.cwd()}/data/internship-applications.json`;
    let apps: Record<string, typeof application> = {};
    try {
      const fs = await import("fs");
      if (fs.existsSync(storePath)) {
        apps = JSON.parse(fs.readFileSync(storePath, "utf-8"));
      }
    } catch {
      return NextResponse.json({ ok: false, error: "Application storage is unavailable. Please contact support." }, { status: 503 });
    }

    apps[applicationId] = application;

    try {
      const fs = await import("fs");
      const dir = `${process.cwd()}/data`;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(storePath, JSON.stringify(apps, null, 2));
    } catch {
      return NextResponse.json({ ok: false, error: "Application storage is unavailable. Please contact support." }, { status: 503 });
    }

    return NextResponse.json({
      ok: true,
      applicationId,
      orderId,
      amount,
      currency: "INR",
      programTitle: application.programTitle,
      categoryTitle: category.name,
      duration: data.duration,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
}
