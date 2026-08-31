import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  enrollmentsStore,
  modulesStore,
  lessonProgressStore,
  submissionsStore,
  create,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireStudentApi(request as unknown as NextRequest);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const enrollment = enrollmentsStore.findOne(
    (e) => e.userId === auth.user.id,
  );
  if (!enrollment) {
    return NextResponse.json(
      { error: "No enrollment found" },
      { status: 404 },
    );
  }

  const categorySlug = enrollment.categorySlug;
  const allModules = modulesStore
    .getAll()
    .filter((m) => m.categorySlug === categorySlug)
    .sort((a, b) => a.order - b.order);

  const userProgress = lessonProgressStore.getByUser(auth.user.id);
  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));

  const userSubmissions = submissionsStore.find(
    (s) => s.studentId === auth.user.id,
  );

  let totalLessons = 0;
  let completedLessons = 0;
  let totalAssignments = 0;
  let approvedAssignments = 0;
  let currentWeek = 1;

  const perModule = allModules.map((module) => {
    const modTotal = module.lessons.length;
    const modCompleted = module.lessons.filter((l) =>
      completedLessonIds.has(l.id),
    ).length;
    totalLessons += modTotal;
    completedLessons += modCompleted;

    let assignmentApproved = false;
    if (module.assignmentId) {
      totalAssignments += 1;
      const sub = userSubmissions.find(
        (s) => s.assignmentId === module.assignmentId,
      );
      if (sub?.status === "approved") {
        approvedAssignments += 1;
        assignmentApproved = true;
      }
    }

    const allDone = modCompleted === modTotal &&
      (!module.assignmentId || assignmentApproved);
    if (allDone) currentWeek = module.week + 1;

    return {
      moduleId: module.id,
      title: module.title,
      week: module.week,
      order: module.order,
      totalLessons: modTotal,
      completedLessons: modCompleted,
      allLessonsDone: modCompleted === modTotal,
      assignmentId: module.assignmentId ?? null,
      assignmentApproved,
    };
  });

  const percent =
    totalLessons === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            ((completedLessons + approvedAssignments * 0.5) /
              (totalLessons + totalAssignments * 0.5)) *
              100,
          ),
        );

  return NextResponse.json({
    overall: {
      percent,
      completedLessons,
      totalLessons,
      approvedAssignments,
      totalAssignments,
      currentWeek,
      allLessonsDone: totalLessons > 0 && completedLessons === totalLessons,
      allAssignmentsApproved:
        totalAssignments > 0 && approvedAssignments === totalAssignments,
    },
    modules: perModule,
  });
}

export async function POST(request: Request) {
  const auth = await requireStudentApi(request as unknown as NextRequest);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  let body: { lessonId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  if (!body.lessonId) {
    return NextResponse.json(
      { error: "lessonId is required" },
      { status: 400 },
    );
  }

  const enrollment = enrollmentsStore.findOne(
    (e) => e.userId === auth.user.id,
  );
  if (!enrollment) {
    return NextResponse.json(
      { error: "No enrollment found" },
      { status: 404 },
    );
  }

  const categoryModules = modulesStore
    .getAll()
    .filter((m) => m.categorySlug === enrollment.categorySlug);
  const allLessonIds = new Set(
    categoryModules.flatMap((m) => m.lessons.map((l) => l.id)),
  );

  if (!allLessonIds.has(body.lessonId)) {
    return NextResponse.json(
      { error: "Lesson not found in your enrolled category" },
      { status: 404 },
    );
  }

  const existing = lessonProgressStore.findOne(
    (p) => p.userId === auth.user.id && p.lessonId === body.lessonId,
  );
  if (existing) {
    return NextResponse.json({
      message: "Lesson already marked as complete",
      progress: existing,
    });
  }

  const entry = {
    userId: auth.user.id,
    lessonId: body.lessonId,
    completedAt: new Date().toISOString(),
  };
  create("lesson-progress", entry);

  return NextResponse.json({
    message: "Lesson marked as complete",
    progress: entry,
  });
}
