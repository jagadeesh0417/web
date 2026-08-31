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

  const enrollmentStart = new Date(enrollment.startedAt);
  const now = new Date();

  // Group modules by week
  const weekMap = new Map<
    number,
    { modules: typeof allModules; title: string }
  >();
  for (const mod of allModules) {
    if (!weekMap.has(mod.week)) {
      weekMap.set(mod.week, { modules: [], title: mod.title });
    }
    weekMap.get(mod.week)!.modules.push(mod);
  }

  // each module = 1 week
  const timeline = Array.from(weekMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([weekNum, { modules: weekModules, title }]) => {
      const weekStart = new Date(enrollmentStart);
      weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Check if all lessons in this week are done
      const allLessonsDone = weekModules.every((m) =>
        m.lessons.every((l) => completedLessonIds.has(l.id)),
      );

      // Check if all assignments are approved
      const allAssignmentsDone = weekModules
        .filter((m) => m.assignmentId)
        .every((m) => {
          const sub = userSubmissions.find(
            (s) => s.assignmentId === m.assignmentId,
          );
          return sub?.status === "approved";
        });

      const isComplete = allLessonsDone && allAssignmentsDone;
      const isPast = weekEnd < now;
      const isCurrent =
        !isPast && weekStart <= now && weekNum === getCurrentWeek(enrollmentStart, allModules, completedLessonIds, userSubmissions);

      let status: "completed" | "current" | "upcoming" | "overdue";
      if (isComplete) {
        status = "completed";
      } else if (isPast && !isComplete) {
        status = "overdue";
      } else if (isCurrent) {
        status = "current";
      } else {
        status = "upcoming";
      }

      // Modules and tasks for this week
      const modulesInfo = weekModules.map((m) => {
        const completedCount = m.lessons.filter((l) =>
          completedLessonIds.has(l.id),
        ).length;
        let taskInfo: Record<string, unknown> | null = null;
        if (m.assignmentId) {
          const task = tasksStore.getById(m.assignmentId);
          const sub = userSubmissions.find(
            (s) => s.assignmentId === m.assignmentId,
          );
          if (task) {
            taskInfo = {
              id: task.id,
              title: task.title,
              submissionStatus: sub?.status ?? null,
              grade: sub?.grade ?? null,
            };
          }
        }
        return {
          moduleId: m.id,
          title: m.title,
          order: m.order,
          totalLessons: m.lessons.length,
          completedLessons: completedCount,
          allLessonsDone: completedCount === m.lessons.length,
          assignment: taskInfo,
        };
      });

      return {
        week: weekNum,
        title: `Week ${weekNum}: ${title}`,
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        status,
        modules: modulesInfo,
      };
    });

  return NextResponse.json({
    enrollment: {
      startedAt: enrollment.startedAt,
      durationWeeks: enrollment.durationWeeks,
      status: enrollment.status,
    },
    timeline,
  });
}

function getCurrentWeek(
  startDate: Date,
  allModules: Array<{ week: number; lessons: Array<{ id: string }>; assignmentId?: string }>,
  completedLessonIds: Set<string>,
  userSubmissions: Array<{ assignmentId: string; status: string }>,
): number {
  let currentWeek = 1;
  for (const m of allModules) {
    const lessonsDone = m.lessons.every((l) => completedLessonIds.has(l.id));
    const sub = userSubmissions.find((s) => s.assignmentId === m.assignmentId);
    const asgApproved = !m.assignmentId || sub?.status === "approved";
    if (lessonsDone && asgApproved) currentWeek = m.week + 1;
  }
  return currentWeek;
}
