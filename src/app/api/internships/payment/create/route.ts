import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fail closed until provider-verified payments and transactional enrollment exist.
export async function POST() {
  return NextResponse.json(
    { ok: false, error: "Checkout is temporarily unavailable." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
