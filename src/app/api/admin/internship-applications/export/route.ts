import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { getDb } from "@/lib/db/mongodb";
import { csvCell } from "@/lib/internships/export-csv";
import { CATEGORY_BY_SLUG } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) {
    auth.error.headers.set("Cache-Control", "no-store");
    return auth.error;
  }
  const status = request.nextUrl.searchParams.get("status");
  const track = request.nextUrl.searchParams.get("track");
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
  if ((status && status !== "pending_payment") || (track && !CATEGORY_BY_SLUG[track]) || (from && !validDate(from)) || (to && !validDate(to)) || (from && to && from > to)) return NextResponse.json({ error: "Invalid filters." }, { status: 400 });
  const filter: Record<string, unknown> = {};
  if (status) filter["application.status"] = status;
  if (track) filter["application.categorySlug"] = track;
  if (from || to) filter["application.createdAt"] = { ...(from ? { $gte: `${from}T00:00:00.000Z` } : {}), ...(to ? { $lte: `${to}T23:59:59.999Z` } : {}) };
  try {
    const records = await (await getDb()).collection("internshipApplications").find(filter).sort({ "application.createdAt": -1 }).toArray();
    const rows = [["Application ID", "Status", "Track", "Plan", "Name", "Email", "Phone", "Created at"], ...records.map(({ application: a }) => [a.id, a.status, a.categoryTitle, a.programTitle, a.student?.fullName, a.student?.email, a.student?.mobile, a.createdAt])];
    console.info("[internship-export]", JSON.stringify({ actor: auth.user.id, at: new Date().toISOString() }));
    return new Response(rows.map((row) => row.map(csvCell).join(",")).join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="internship-applications.csv"', "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Export unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
