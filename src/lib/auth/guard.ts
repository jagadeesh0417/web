import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "./cookies";
import { verifySession } from "./jwt";

export async function requireAuth(
  request: NextRequest,
): Promise<{ userId: string; role: string } | { error: NextResponse }> {
  const token = getSessionFromRequest(request);
  if (!token) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  const session = await verifySession(token);
  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 },
      ),
    };
  }

  return session;
}

export async function requireAdmin(
  request: NextRequest,
): Promise<{ userId: string } | { error: NextResponse }> {
  const result = await requireAuth(request);
  if ("error" in result) return result;

  if (result.role !== "admin" && result.role !== "super_admin") {
    return {
      error: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      ),
    };
  }

  return { userId: result.userId };
}

export async function requireStudent(
  request: NextRequest,
): Promise<{ userId: string } | { error: NextResponse }> {
  const result = await requireAuth(request);
  if ("error" in result) return result;

  if (result.role !== "intern" && result.role !== "applicant") {
    return {
      error: NextResponse.json(
        { error: "Student access required" },
        { status: 403 },
      ),
    };
  }

  return { userId: result.userId };
}
