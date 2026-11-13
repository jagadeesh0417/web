import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  const key = process.env.RAZORPAY_KEY_ID || "";
  const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const mode = key.startsWith("rzp_test_") ? "test" : key.startsWith("rzp_live_") ? "live" : "unconfigured";
  return NextResponse.json({
    mode,
    keyIdConfigured: Boolean(key),
    keySecretConfigured: Boolean(process.env.RAZORPAY_KEY_SECRET),
    webhookSecretConfigured: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
    publicKeyMatches: Boolean(key && publicKey && key === publicKey),
    checkoutEnabled: false,
  }, { headers: { "Cache-Control": "no-store" } });
}
