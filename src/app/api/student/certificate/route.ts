import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  enrollmentsStore,
  certificatesStore,
  modulesStore,
  lessonProgressStore,
  submissionsStore,
} from "@/lib/data/server-store";
import { hasPassedAssessment } from "@/lib/data/repository";

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

  // Check certificate existence
  const certificate = certificatesStore.findOne(
    (c) => c.studentId === auth.user.id,
  );

  // Compute eligibility
  const allModules = modulesStore
    .getAll()
    .filter((m) => m.categorySlug === enrollment.categorySlug);
  const userProgress = lessonProgressStore.getByUser(auth.user.id);
  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));
  const totalLessons = allModules.reduce(
    (acc, m) => acc + m.lessons.length,
    0,
  );
  const completedLessons = allModules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => completedLessonIds.has(l.id)).length,
    0,
  );
  const allLessonsDone = totalLessons > 0 && completedLessons === totalLessons;

  const userSubmissions = submissionsStore.find(
    (s) => s.studentId === auth.user.id,
  );
  const assignmentsWithModules = allModules.filter((m) => m.assignmentId);
  const approvedAssignments = assignmentsWithModules.filter((m) => {
    const sub = userSubmissions.find(
      (s) => s.assignmentId === m.assignmentId,
    );
    return sub?.status === "approved";
  }).length;
  const allAssignmentsApproved =
    assignmentsWithModules.length > 0 &&
    approvedAssignments === assignmentsWithModules.length;

  const passedAssessment = hasPassedAssessment(auth.user.id);
  const assessmentEligible =
    enrollment.status === "active" &&
    allLessonsDone &&
    allAssignmentsApproved &&
    passedAssessment;

  const reasons: string[] = [];
  if (enrollment.status !== "active")
    reasons.push("Enrollment must be active.");
  if (!allLessonsDone) reasons.push("Complete all course lessons.");
  if (!allAssignmentsApproved)
    reasons.push("Get all assignments approved.");
  if (!passedAssessment) reasons.push("Pass the final assessment.");

  return NextResponse.json({
    certificate: certificate
      ? {
          id: certificate.id,
          certificateId: certificate.certificateId,
          studentName: certificate.studentName,
          categoryName: certificate.categoryName,
          programTitle: certificate.programTitle,
          durationWeeks: certificate.durationWeeks,
          startDate: certificate.startDate,
          endDate: certificate.endDate,
          issuedAt: certificate.issuedAt,
          score: certificate.score,
          issuedBy: certificate.issuedBy,
        }
      : null,
    eligibility: {
      eligible: assessmentEligible,
      reasons,
      progress: {
        allLessonsDone,
        completedLessons,
        totalLessons,
        allAssignmentsApproved,
        approvedAssignments,
        totalAssignments: assignmentsWithModules.length,
        passedAssessment,
      },
    },
  });
}
