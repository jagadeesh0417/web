import { cookies } from "next/headers";
import type { AppUser, Role } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";

function parseDemoSession(raw: string | null): { userId: string; role: Role } | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(decodeURIComponent(raw));
    if (data?.userId && data?.role) return data as { userId: string; role: Role };
  } catch {
    return null;
  }
  return null;
}

function isStudentRole(role: Role): boolean {
  return role === "intern" || role === "applicant";
}

export async function getStudentSession(): Promise<AppUser | null> {
  const cookieStore = await cookies();

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return null;
      const role = (user.user_metadata?.role as Role) ?? "user";
      if (!isStudentRole(role)) return null;
      return {
        id: user.id,
        email: user.email ?? "",
        name: (user.user_metadata?.full_name as string) ?? user.email?.split("@")[0] ?? "User",
        role,
        emailVerified: Boolean(user.email_confirmed_at),
        avatarUrl: user.user_metadata?.avatar_url as string | undefined,
        createdAt: user.created_at,
      };
    } catch {
      // Supabase auth failed — fall through to demo mode
    }
  }

  const raw = cookieStore.get("ak_demo_session")?.value ?? null;
  const session = parseDemoSession(raw);
  if (!session) return null;
  if (!isStudentRole(session.role)) return null;

  const { seedInitialData, usersStore } = await import("@/lib/data/server-store");
  seedInitialData();
  const user = usersStore.getById(session.userId);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: session.role,
    emailVerified: true,
    createdAt: user.createdAt ?? new Date().toISOString(),
  };
}

export async function requireStudent(): Promise<AppUser> {
  const user = await getStudentSession();
  if (!user) {
    throw new Error("Unauthorized: student access required");
  }
  return user;
}
