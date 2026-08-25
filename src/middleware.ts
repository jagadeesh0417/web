import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { homeForRole } from "@/lib/rbac";
import type { Role } from "@/lib/types";

const PUBLIC_PATHS = [
  "/",
  "/services",
  "/company",
  "/about",
  "/contact",
  "/portfolio",
  "/our-work",
  "/blog",
  "/internships",
  "/verify",
  "/verify-certificate",
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
    if (isPublic(pathname)) return response;
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    const role = (user.user_metadata?.role as Role) ?? "user";
    const allowed = ROLE_PATHS[pathname.split("/")[1] ? `/${pathname.split("/")[1]}` : pathname];
    if (allowed && !allowed.includes(role)) {
      return NextResponse.redirect(new URL(homeForRole(role), request.url));
    }
    return response;
  }

  // Demo mode
  const session = parseDemoSession(request.cookies.get("ak_demo_session")?.value ?? null);

  if (pathname === "/dashboard") {
    if (!session) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.redirect(new URL(homeForRole(session.role), request.url));
  }

  if (isPublic(pathname)) return NextResponse.next();

  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
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
