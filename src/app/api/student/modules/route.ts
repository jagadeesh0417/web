import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  enrollmentsStore,
  modulesStore,
  lessonProgressStore,
  tasksStore,
  submissionsStore,
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

  const modulesWithProgress = allModules.map((module, idx) => {
    let unlocked = true;
    let lockReason: string | undefined;

    if (idx > 0) {
      const prevModule = allModules[idx - 1];
      const prevLessonsDone = prevModule.lessons.every((l) =>
        completedLessonIds.has(l.id),
      );
      if (!prevLessonsDone) {
        unlocked = false;
        lockReason = "Complete every lesson in the previous week first.";
      } else if (prevModule.assignmentId) {
        const prevSubmission = userSubmissions.find(
          (s) => s.assignmentId === prevModule.assignmentId,
        );
        if (prevSubmission?.status !== "approved") {
          unlocked = false;
          lockReason = "Get the previous week's assignment approved to unlock this module.";
        }
      }
    }

    const lessonsWithProgress = module.lessons.map((lesson) => ({
      ...lesson,
      completed: completedLessonIds.has(lesson.id),
    }));

    const completedLessons = lessonsWithProgress.filter((l) => l.completed).length;

    let assignment: Record<string, unknown> | null = null;
    if (module.assignmentId) {
      const task = tasksStore.getById(module.assignmentId);
      const submission = userSubmissions.find(
        (s) => s.assignmentId === module.assignmentId,
      );
      if (task) {
        assignment = {
          id: task.id,
          title: task.title,
          description: task.description,
          deadlineDays: task.deadlineDays,
          status: task.status ?? "open",
          submissionStatus: submission?.status ?? null,
          grade: submission?.grade ?? null,
          feedback: submission?.feedback ?? null,
        };
      }
    }

    return {
      id: module.id,
      title: module.title,
      order: module.order,
      week: module.week,
      description: module.description,
      lessonsCount: module.lessons.length,
      completedLessons,
      allLessonsDone: completedLessons === module.lessons.length,
      lessons: lessonsWithProgress,
      assignment,
      resources: module.resources,
      unlocked,
      lockReason,
    };
  });

  return NextResponse.json({ modules: modulesWithProgress });
}
