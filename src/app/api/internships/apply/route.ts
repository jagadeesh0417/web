import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { CATEGORY_BY_SLUG, PROGRAM_BY_SLUG } from "@/lib/constants";
import { randomId } from "@/lib/utils";

const bodySchema = z.object({
  categorySlug: z.string().min(1),
  programSlug: z.string().min(1),
  duration: z.number().refine((d) => [4, 6, 8].includes(d), "Duration must be 4, 6, or 8 weeks"),
  fullName: z.string().min(2).max(100),
  email: z.string().email().max(254),
  confirmEmail: z.string().email().max(254),
  mobile: z.string().min(10).max(20),
  dob: z.string().optional(),
  gender: z.string().optional(),
  college: z.string().min(1).max(200),
  course: z.string().min(1).max(200),
  branch: z.string().optional(),
  graduationYear: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  referralCode: z.string().optional(),
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

    const category = CATEGORY_BY_SLUG[data.categorySlug as keyof typeof CATEGORY_BY_SLUG];
    if (!category) {
      return NextResponse.json({ ok: false, errors: { categorySlug: "Internship category not found." } }, { status: 404 });
    }

    const program = PROGRAM_BY_SLUG[data.programSlug as keyof typeof PROGRAM_BY_SLUG];
    if (!program) {
      return NextResponse.json({ ok: false, errors: { programSlug: "Program not found." } }, { status: 404 });
    }

    const year = new Date().getFullYear();
    const applicationId = `INT-${year}-${randomId(8).toUpperCase()}`;
    const orderId = `ORD-${year}-${randomId(8).toUpperCase()}`;

    const durationWeeks = parseInt(program.duration.match(/(\d+)/)?.[1] ?? "4", 10);
    const amount = Math.round(
      program.price * (data.duration / durationWeeks) * (data.duration === 8 ? 0.95 : 1),
    );

    const application = {
      id: applicationId,
      orderId,
      status: "pending_payment" as const,
      categorySlug: data.categorySlug,
      categoryTitle: category.name,
      programSlug: data.programSlug,
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
      // file doesn't exist yet
    }

    apps[applicationId] = application;

    try {
      const fs = await import("fs");
      const dir = `${process.cwd()}/data`;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(storePath, JSON.stringify(apps, null, 2));
    } catch {
      // storage failure — continue anyway for demo
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
