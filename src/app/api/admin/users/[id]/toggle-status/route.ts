import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/auth/api-guard";
import { seedInitialData, usersStore, auditLog } from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INACTIVE_ROLES = new Set(["guest"]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi(request);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const { id } = await params;
  const user = usersStore.getById(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isActive = !INACTIVE_ROLES.has(user.role);
  const newRole = isActive ? "guest" : "user";
  const updated = usersStore.update(id, { role: newRole } as Partial<typeof user>);

  if (!updated) {
    return NextResponse.json({ error: "Failed to toggle status" }, { status: 500 });
  }

  const newStatus = INACTIVE_ROLES.has(newRole) ? "inactive" : "active";
  auditLog(
    "user.toggle_status",
    "users",
    `Toggled ${user.name} (${user.email}) to ${newStatus}`,
    auth.user.id,
    id,
  );

  return NextResponse.json({
    success: true,
    user: updated,
    status: newStatus,
  });
}
