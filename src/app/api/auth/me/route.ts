import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, COLLECTIONS } from "@/lib/db";
import { verifySession } from "@/lib/auth/jwt";
import { getSessionFromRequest } from "@/lib/auth/cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = getSessionFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired session" },
        { status: 401 },
      );
    }

    const db = await getDb();
    const users = db.collection(COLLECTIONS.users);

    const user = await users.findOne(
      { _id: new ObjectId(session.userId) },
      { projection: { passwordHash: 0 } },
    );

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        referralCode: user.referralCode,
        referredByUserId: user.referredBy?.toString() ?? null,
        walletBalance: user.walletBalance,
        totalReferralEarnings: user.totalReferralEarnings,
        totalWithdrawn: user.totalWithdrawn,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
