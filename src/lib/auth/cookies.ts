import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export function setSessionCookie(token: string): NextResponse {
  const response = NextResponse.next();
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}

export function getSessionFromRequest(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export function clearSessionCookie(): NextResponse {
  const response = NextResponse.next();
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
