import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import { seedInitialData, usersStore } from "@/lib/data/server-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireStudentApi(request as unknown as NextRequest);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!body.currentPassword || !body.newPassword) {
    return NextResponse.json(
      { error: "currentPassword and newPassword are required" },
      { status: 400 },
    );
  }

  if (body.newPassword.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters" },
      { status: 400 },
    );
  }

  const user = usersStore.getById(auth.user.id);
  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 },
    );
  }

  if (isSupabaseConfigured()) {
    try {
      const { createServerClient } = await import("@supabase/ssr");
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return [];
            },
            setAll() {},
          },
        },
      );

      // Re-authenticate with current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: body.currentPassword,
      });
      if (signInError) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 403 },
        );
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: body.newPassword,
      });
      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        message: "Password updated successfully",
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 },
      );
    }
  }

  // Demo mode: password hashes are managed client-side via localStorage.
  // The server-store users don't store passwordHash. We acknowledge the
  // change and let the client-side demo-store handle the actual hash update.
  // In a production system, you'd store hashes in the database.
  return NextResponse.json({
    message: "Password updated successfully",
    note: "demo",
  });
}
