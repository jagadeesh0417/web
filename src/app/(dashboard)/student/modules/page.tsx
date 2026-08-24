"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Lock, ArrowRight, FileText } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/auth";
import { getStudentProgress, getModuleLockStates, getAssignmentApproved, getAssignmentById, isLessonComplete } from "@/lib/data/repository";
import type { AppUser } from "@/lib/types";

export default function ModulesPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const p = getStudentProgress(user.id);
  const locks = getModuleLockStates(user.id, p.enrollment?.categorySlug ?? "web-development");

  if (!p.enrollment) {
    return (
      <DashboardShell>
        <PageHeader title="Course Modules" description="Your weekly curriculum." />
        <EmptyState icon={<BookOpen className="h-10 w-10" />} title="No program yet" description="Enroll in an internship to access your modules." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader title="Course Modules" description="Self-paced · complete each week to unlock the next. Only videos you finish unlock the assignment." />

      <div className="space-y-4">
        {p.modules.map((m) => {
          const lock = locks[m.id];
          const lessonIdsDone = m.lessons.filter((l) => isLessonComplete(user.id, l.id));
          const weekDone = lessonIdsDone.length === m.lessons.length;
          const asgApproved = m.assignmentId ? getAssignmentApproved(m.assignmentId, user.id) : true;
          const assignment = m.assignmentId ? getAssignmentById(m.assignmentId) : undefined;

          return (
            <Card key={m.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold ${weekDone && asgApproved ? "bg-success/10 text-success" : lock?.unlocked ? "bg-brand-600/10 text-brand-500" : "bg-muted text-muted-foreground"}`}>
                      {weekDone && asgApproved ? <CheckCircle2 className="h-5 w-5" /> : lock?.unlocked ? <BookOpen className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={lock?.unlocked ? "primary" : "outline"}>Week {m.week}</Badge>
                        {weekDone && asgApproved && <Badge variant="success">Completed</Badge>}
                        {weekDone && !asgApproved && <Badge variant="warning">Assignment in review</Badge>}
                      </div>
                      <h3 className="mt-1 font-semibold">{m.title}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lessonIdsDone.length}/{m.lessons.length} lessons watched · {assignment ? assignment.title : "no assignment"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {lock?.unlocked ? (
                      <Link href={`/student/modules/${m.id}`}>
                        <Button variant="gradient" size="sm">Open module <ArrowRight className="h-4 w-4" /></Button>
                      </Link>
                    ) : (
                      <div className="max-w-[240px] text-right">
                        <p className="flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground">
                          <Lock className="h-3 w-3" /> Locked
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{lock.reason ?? "Complete the previous week first."}</p>
                      </div>
                    )}
                  </div>
                </div>
                {lock?.unlocked && (
                  <Progress value={Math.round((lessonIdsDone.length / m.lessons.length) * 100)} className="mt-4" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
        <p>
          <strong className="text-foreground">How it works:</strong> watch the recorded video for each lesson and press{" "}
          <strong className="text-foreground">Mark Lesson Complete</strong>. Once all lessons in a week are complete, the weekly assignment unlocks. Your mentor&apos;s approval of that assignment unlocks the next week.
        </p>
      </div>
    </DashboardShell>
  );
}
