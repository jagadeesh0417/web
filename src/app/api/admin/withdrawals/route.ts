import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin-session";
import {
  seedInitialData,
  withdrawalsStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  await seedInitialData();

  const withdrawals = withdrawalsStore
    .getAll()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return NextResponse.json({ ok: true, withdrawals });
}
