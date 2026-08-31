import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  usersStore,
  find,
  create,
  update,
} from "@/lib/data/server-store";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireStudentApi(request as unknown as NextRequest);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  let body: {
    name?: string;
    phone?: string;
    college?: string;
    course?: string;
    year?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // Update user name if provided
  if (body.name) {
    usersStore.update(auth.user.id, { name: body.name });
  }

  // Upsert profile
  const profiles = find<Profile>("profiles", (p) => p.userId === auth.user.id);
  const existingProfile = profiles.length > 0 ? profiles[0] : null;

  const profileData: Profile = {
    id: existingProfile?.id ?? `prof_${auth.user.id}`,
    userId: auth.user.id,
    fullName: body.name ?? existingProfile?.fullName ?? auth.user.name,
    mobile: body.phone ?? existingProfile?.mobile ?? "",
    email: auth.user.email,
    college: body.college ?? existingProfile?.college,
    course: body.course ?? existingProfile?.course,
    yearOfStudy: body.year ?? existingProfile?.yearOfStudy,
  };

  if (existingProfile) {
    update<Profile>("profiles", existingProfile.id, profileData);
  } else {
    create<Profile>("profiles", profileData);
  }

  return NextResponse.json({
    message: "Profile updated successfully",
    profile: profileData,
  });
}
