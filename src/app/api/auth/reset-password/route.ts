import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { passwordSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-in-production";

const resetSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export async function POST(request: NextRequest) {
  try {
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const parsed = resetSchema.safeParse(json);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errors[key]) errors[key] = issue.message;
      }
      return NextResponse.json(
        { ok: false, error: "Validation failed", details: errors },
        { status: 400 },
      );
    }

    const { token, newPassword } = parsed.data;

    let decoded: { userId: string; type: string };
    try {
      decoded = jwt.verify(token, AUTH_SECRET) as { userId: string; type: string };
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    if (decoded.type !== "password_reset") {
      return NextResponse.json(
        { ok: false, error: "Invalid token type" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const users = db.collection(COLLECTIONS.users);

    const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 },
      );
    }

    const passwordHash = await hashPassword(newPassword);

    await users.updateOne(
      { _id: user._id },
      { $set: { passwordHash, updatedAt: new Date() }, $unset: { resetToken: "" } },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
