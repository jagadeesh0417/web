import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  enrollmentsStore,
  projectsStore,
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

  // Projects linked by team membership or all for the category
  const allProjects = projectsStore.getAll();
  const studentProjects = allProjects.filter(
    (p) =>
      p.team.includes(auth.user.id) ||
      p.clientId === auth.user.id,
  );

  const projectsWithStatus = studentProjects.map((project) => ({
    id: project.id,
    name: project.name,
    clientName: project.clientName,
    service: project.service,
    status: project.status,
    progress: project.progress,
    startDate: project.startDate,
    dueDate: project.dueDate,
    description: project.description,
    milestones: project.milestones,
  }));

  // If no team/client projects, return category-relevant sample projects
  if (projectsWithStatus.length === 0) {
    return NextResponse.json({ projects: [] });
  }

  return NextResponse.json({ projects: projectsWithStatus });
}
