import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, referralConfigStore, programsStore, auditLog } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  await seedInitialData();

  const config = referralConfigStore.get();
  const programs = programsStore.getAll();

  return NextResponse.json({ ok: true, config, programs });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;

  await seedInitialData();

  const body = await request.json();

  const updated = referralConfigStore.update({
    fourWeekPrice: body.fourWeekPrice,
    sixWeekPrice: body.sixWeekPrice,
    eightWeekPrice: body.eightWeekPrice,
    referralReward: body.referralReward,
    minimumWithdrawal: body.minimumWithdrawal,
  });

  const durationToPrice: Record<string, number> = {
    "4 Weeks": body.fourWeekPrice,
    "6 Weeks": body.sixWeekPrice,
    "8 Weeks": body.eightWeekPrice,
  };

  const programs = programsStore.getAll();
  const durationMap: Record<string, string> = {
    "4 Weeks": "fourWeekPrice",
    "6 Weeks": "sixWeekPrice",
    "8 Weeks": "eightWeekPrice",
  };

  const updatedFields: string[] = [];

  for (const program of programs) {
    const field = durationMap[program.duration];
    if (field && body[field] !== undefined) {
      programsStore.update(program.id, { price: body[field] });
      updatedFields.push(`${program.title}: ₹${body[field]}`);
    }
  }

  const changes = Object.entries(durationToPrice)
    .filter(([, price]) => price !== undefined)
    .map(([dur, price]) => `${dur} = ₹${price}`)
    .join(", ");

  auditLog(
    "update",
    "pricing",
    `Pricing updated: ${changes}${updatedFields.length ? ` | Programs synced: ${updatedFields.join("; ")}` : ""}`,
    auth.user.id,
    updated?.id,
  );

  return NextResponse.json({ ok: true, config: updated });
}
