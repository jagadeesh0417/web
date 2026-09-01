import jwt from "jsonwebtoken";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-in-production";

export async function createSession(
  userId: string,
  role: string,
): Promise<string> {
  const payload = { userId, role };
  const token = jwt.sign(payload, AUTH_SECRET, { expiresIn: "7d" });
  return token;
}

export async function verifySession(
  token: string,
): Promise<{ userId: string; role: string } | null> {
  try {
    const decoded = jwt.verify(token, AUTH_SECRET) as {
      userId: string;
      role: string;
    };
    return { userId: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}
