import { NextResponse, type NextRequest } from "next/server";
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

export async function requireStudentApi(
  request: NextRequest,
): Promise<{ user: AppUser } | { error: NextResponse }> {
  if (isSupabaseConfigured()) {
    try {
      const { createServerClient } = await import("@supabase/ssr");
      let response = NextResponse.next({ request });
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              for (const { name, value } of cookiesToSet) {
                request.cookies.set(name, value);
              }
              response = NextResponse.next({ request });
              for (const { name, value, options } of cookiesToSet) {
                response.cookies.set(name, value, options);
              }
            },
          },
        },
      );

      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        return {
          error: NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          ),
        };
      }
      const role = (user.user_metadata?.role as Role) ?? "user";
      if (!isStudentRole(role)) {
        return {
          error: NextResponse.json(
            { error: "Student access required" },
            { status: 403 },
          ),
        };
      }
      return {
        user: {
          id: user.id,
          email: user.email ?? "",
          name:
            (user.user_metadata?.full_name as string) ??
            user.email?.split("@")[0] ??
            "User",
          role,
          emailVerified: Boolean(user.email_confirmed_at),
          avatarUrl: user.user_metadata?.avatar_url as string | undefined,
          createdAt: user.created_at,
        },
      };
    } catch {
      // Supabase failed — fall through to demo mode
    }
  }

  const raw = request.cookies.get("ak_demo_session")?.value ?? null;
  const session = parseDemoSession(raw);
  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }
  if (!isStudentRole(session.role)) {
    return {
      error: NextResponse.json(
        { error: "Student access required" },
        { status: 403 },
      ),
    };
  }
  const { seedInitialData, usersStore } = await import("@/lib/data/server-store");
  seedInitialData();
  const user = usersStore.getById(session.userId);
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "User not found" },
        { status: 401 },
      ),
    };
  }
  return {
    user: {
      id: session.userId,
      email: user.email,
      name: user.name,
      role: session.role,
      emailVerified: true,
      createdAt: user.createdAt ?? new Date().toISOString(),
    },
  };
}
