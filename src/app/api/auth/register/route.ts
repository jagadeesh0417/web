import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/jwt";
import { nameSchema, emailSchema, phoneSchema, passwordSchema } from "@/lib/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return "AKR" + code;
}

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

    const parsed = registerSchema.safeParse(json);
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

    const { name, email, phone, password, referralCode } = parsed.data;

    const db = await getDb();
    const users = db.collection(COLLECTIONS.users);

    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    let referredBy: ObjectId | null = null;
    if (referralCode) {
      const referrer = await users.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const now = new Date();
    const newUser = {
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: "USER" as const,
      referralCode: generateReferralCode(),
      referredBy,
      walletBalance: 0,
      totalReferralEarnings: 0,
      totalWithdrawn: 0,
      accountStatus: "ACTIVE" as const,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    const result = await users.insertOne(newUser);

    const token = await createSession(result.insertedId.toString(), "USER");

    const response = NextResponse.json(
      {
        ok: true,
        user: {
          id: result.insertedId.toString(),
          name,
          email: email.toLowerCase(),
          role: "USER",
        },
      },
      { status: 201 },
    );

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
