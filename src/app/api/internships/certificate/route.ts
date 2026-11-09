import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The current assessment is graded in the browser against demo questions and
// cannot establish eligibility. Do not issue certificates until a persistent,
// authenticated server-side assessment and enrollment workflow replaces it.
export async function POST() {
  return NextResponse.json(
    { ok: false, error: "Certificate issuance is unavailable while assessment verification is being upgraded." },
    { status: 503 },
  );
}
