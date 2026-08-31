import { NextResponse } from "next/server";
import { companySettingsStore } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const settings = companySettingsStore.get();
  if (!settings) {
    return NextResponse.json({ ok: false, error: "No settings found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, settings });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = companySettingsStore.update(body);
    return NextResponse.json({ ok: true, settings: updated });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to update settings" }, { status: 500 });
  }
}
