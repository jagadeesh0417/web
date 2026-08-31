import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { PROGRAM_BY_SLUG } from "@/lib/constants";
import { randomId } from "@/lib/utils";

const bodySchema = z.object({
  applicationId: z.string().min(1),
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

    const { applicationId } = parsed.data;
    const apps = await loadApplications();
    const app = apps[applicationId] as Record<string, unknown> | undefined;

    if (!app) {
      return NextResponse.json({ ok: false, error: "Application not found." }, { status: 404 });
    }

    if (app.status !== "pending_payment") {
      return NextResponse.json({ ok: false, error: "Application is not awaiting payment." }, { status: 400 });
    }

    const programSlug = app.programSlug as string;
    const duration = app.duration as number;

    const program = PROGRAM_BY_SLUG[programSlug as keyof typeof PROGRAM_BY_SLUG];
    if (!program) {
      return NextResponse.json({ ok: false, error: "Program not found." }, { status: 404 });
    }

    const serverAmount = Math.round(
      program.price * (duration / program.durationWeeks) * (duration === 8 ? 0.95 : 1),
    );

    const year = new Date().getFullYear();
    const paymentOrderId = `PAY-${year}-${randomId(8).toUpperCase()}`;

    app.status = "payment_processing";
    app.paymentOrderId = paymentOrderId;
    app.paymentAmount = serverAmount;
    app.paymentStartedAt = new Date().toISOString();

    apps[applicationId] = app;
    await saveApplications(apps);

    // In demo mode: simulate immediate successful payment
    return NextResponse.json({
      ok: true,
      orderId: paymentOrderId,
      amount: serverAmount,
      currency: "INR",
      status: "processing",
      demoAutoComplete: true,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Internal server error." }, { status: 500 });
  }
}
