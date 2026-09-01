import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  walletTransactionsStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireStudentApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const transactions = walletTransactionsStore.find(
    (t) => t.userId === auth.user.id,
  );

  const history = transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    description: t.description,
    status: t.status,
    createdAt: t.createdAt,
  }));

  return NextResponse.json({ ok: true, transactions: history });
}
