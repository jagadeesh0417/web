import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getDb, COLLECTIONS } from "@/lib/db";
import { forgotSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-in-production";

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

    const parsed = forgotSchema.safeParse(json);
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

    const { email } = parsed.data;

    const db = await getDb();
    const users = db.collection(COLLECTIONS.users);

    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({
        ok: true,
        message: "If an account exists with this email, a reset link has been sent.",
      });
    }

    const resetToken = jwt.sign(
      { userId: user._id.toString(), type: "password_reset" },
      AUTH_SECRET,
      { expiresIn: "1h" },
    );

    await users.updateOne(
      { _id: user._id },
      { $set: { resetToken, updatedAt: new Date() } },
    );

    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        ok: true,
        message: "If an account exists with this email, a reset link has been sent.",
        _debug: { resetToken },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists with this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
