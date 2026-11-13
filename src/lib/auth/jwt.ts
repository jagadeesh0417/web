import jwt from "jsonwebtoken";

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret === "dev-secret-change-in-production" || secret === "your-secret-key-here") throw new Error("AUTH_SECRET must be configured");
  return secret;
}

export async function createSession(
  userId: string,
  role: string,
): Promise<string> {
  const payload = { userId, role };
  const token = jwt.sign(payload, authSecret(), { expiresIn: "7d" });
  return token;
}

export async function verifySession(
  token: string,
): Promise<{ userId: string; role: string } | null> {
  try {
    const decoded = jwt.verify(token, authSecret()) as {
      userId: string;
      role: string;
    };
    return { userId: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}
