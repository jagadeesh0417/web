import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, plansConfigStore, auditLog } from "@/lib/data/server-store";
import type { PlanConfig } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const configSchema = z.object({
  razorpayKeyId: z.string().min(1),
  razorpayKeySecret: z.string().min(1),
  environment: z.enum(["test", "live"]),
  currency: z.string().min(1).max(10).optional().default("INR"),
});

function maskSecret(secret: string): string {
  if (secret.length <= 8) return "••••••••••••••••";
  return "••••••••••••••••" + secret.slice(-4);
}

function maskKeyId(keyId: string): string {
  if (keyId.length <= 8) return "••••••••••••••••";
  const visible = keyId.slice(-6);
  return keyId.slice(0, keyId.length - 6).replace(/./g, "•") + visible;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const configs = plansConfigStore.getAll();
  const config = configs[0];

  if (!config) {
    return NextResponse.json({
      razorpayKeyId: "",
      razorpayKeySecret: "",
      environment: "test",
      currency: "INR",
    });
  }

  return NextResponse.json({
    id: config.id,
    razorpayKeyId: maskKeyId(config.razorpayKeyId),
    razorpayKeySecret: maskSecret(config.razorpayKeySecret),
    environment: config.environment,
    currency: config.currency,
    updatedAt: config.updatedAt,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const body = await request.json();
  const parsed = configSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const now = new Date().toISOString();
  const configs = plansConfigStore.getAll();
  const existing = configs[0];

  let config: PlanConfig;

  if (existing) {
    const updated = plansConfigStore.update(existing.id, {
      razorpayKeyId: data.razorpayKeyId,
      razorpayKeySecret: data.razorpayKeySecret,
      environment: data.environment,
      currency: data.currency,
      updatedAt: now,
    });
    config = updated!;
  } else {
    config = {
      id: `pcfg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      razorpayKeyId: data.razorpayKeyId,
      razorpayKeySecret: data.razorpayKeySecret,
      environment: data.environment,
      currency: data.currency,
      updatedAt: now,
    };
    plansConfigStore.create(config);
  }

  auditLog("update", "payment-config", `Updated Razorpay config (${data.environment})`, auth.user.id, config.id);

  return NextResponse.json({
    id: config.id,
    razorpayKeyId: maskKeyId(config.razorpayKeyId),
    razorpayKeySecret: maskSecret(config.razorpayKeySecret),
    environment: config.environment,
    currency: config.currency,
    updatedAt: config.updatedAt,
  });
}
