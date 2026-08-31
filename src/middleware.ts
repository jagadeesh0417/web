import { NextResponse, type NextRequest } from "next/server";
import { homeForRole } from "@/lib/rbac";
import type { Role } from "@/lib/types";

const PUBLIC_PATHS = [
  "/",
  "/services",
  "/about",
  "/contact",
  "/internships",
  "/verify",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/create-password",
  "/auth",
  "/api",
  "/_next",
];

const ADMIN_PUBLIC_PATHS = ["/admin/login"];

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin") && !ADMIN_PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAdminApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/admin");
}

const ROLE_PATHS: Record<string, Role[]> = {
  "/student": ["intern", "applicant"],
  "/client": ["client"],
  "/mentor": ["mentor"],
  "/employee": ["employee"],
  "/admin": ["admin", "super_admin"],
};

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dashboard") {
    if (!request.cookies.get("sb-akr-auth-token") && !request.cookies.get("ak_demo_session")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (supabaseConfigured) {
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
      if (isPublic(pathname) && !isAdminRoute(pathname) && !isAdminApiRoute(pathname)) return response;
      if (!user) {
        if (isAdminRoute(pathname) || isAdminApiRoute(pathname)) {
          return NextResponse.redirect(new URL("/admin/login", request.url));
        }
        const url = new URL("/login", request.url);
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }
      const role = (user.user_metadata?.role as Role) ?? "user";
      if (isAdminRoute(pathname) || isAdminApiRoute(pathname)) {
        if (role !== "admin" && role !== "super_admin") {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
      const allowed = ROLE_PATHS[pathname.split("/")[1] ? `/${pathname.split("/")[1]}` : pathname];
      if (allowed && !allowed.includes(role)) {
        return NextResponse.redirect(new URL(homeForRole(role), request.url));
      }
      return response;
    } catch {
      // Supabase auth failed — fall through to demo mode
    }
  }

  // Demo mode
  const session = parseDemoSession(request.cookies.get("ak_demo_session")?.value ?? null);

  if (pathname === "/dashboard") {
    if (!session) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.redirect(new URL(homeForRole(session.role), request.url));
  }

  if (isPublic(pathname) && !isAdminRoute(pathname) && !isAdminApiRoute(pathname)) return NextResponse.next();

  if (!session) {
    if (isAdminRoute(pathname) || isAdminApiRoute(pathname)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute(pathname) || isAdminApiRoute(pathname)) {
    if (session.role !== "admin" && session.role !== "super_admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const segment = `/${pathname.split("/")[1]}`;
  const allowed = ROLE_PATHS[segment];
  if (allowed && !allowed.includes(session.role)) {
    return NextResponse.redirect(new URL(homeForRole(session.role), request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
