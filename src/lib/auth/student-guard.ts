import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { seedInitialData, usersStore } from "@/lib/data/server-store";

function parseDemoSession(raw: string | null): { userId: string; role: string } | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(decodeURIComponent(raw));
    if (data?.userId && data?.role) return data as { userId: string; role: string };
  } catch {
    return null;
  }
  return null;
}

export async function requireStudent(
  request: NextRequest,
): Promise<{ userId: string } | { error: NextResponse }> {
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
      if (!data.user) {
        return {
          error: NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          ),
        };
      }
      return { userId: data.user.id };
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
  return { userId: session.userId };
}
