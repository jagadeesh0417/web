"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, BookOpen, ClipboardCheck, FileText, Hourglass, Lock, PartyPopper, CheckCircle2, XCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/auth";
import { getStudentProgress, getModuleLockStates, getAnnouncementsForUser, getCertificateEligibility, getAssessmentEligibility, hasPassedAssessment } from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

export default function StudentDashboard() {
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
  const certEligibility = getCertificateEligibility(user.id);
  const assessmentEligibility = getAssessmentEligibility(user.id);
  const announcements = getAnnouncementsForUser(user.id).slice(0, 3);
  const pendingAssignments = p.totalAssignments - p.approvedAssignments;

  if (!p.enrollment) {
    return (
      <DashboardShell>
        <PageHeader title="Welcome to Akradhii" description="Your internship journey starts here." />
        <EmptyState
          icon={<Hourglass className="h-10 w-10" />}
          title="No active internship yet"
          description="Enroll in an internship to unlock your course modules, assignments and certificate."
          action={
            <Link href="/internships">
              <Button variant="gradient">Browse internships</Button>
            </Link>
          }
        />
      </DashboardShell>
    );
  }

  const assessmentPassed = hasPassedAssessment(user.id);

  return (
    <DashboardShell>
      <PageHeader
        title={`Hey, ${user.name.split(" ")[0]} 👋`}
        description={p.enrollment.programTitle}
        actions={
          <Badge variant="success" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current" /> {p.enrollment.durationWeeks}-week program
          </Badge>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Overall progress" value={`${p.percent}%`} hint={`${p.completedLessons}/${p.totalLessons} lessons`} icon={BookOpen} gradient="bg-gradient-to-br from-violet-600 to-indigo-600" />
        <StatCard title="Current week" value={`Week ${Math.min(p.currentWeek, p.modules.length)}`} hint={`of ${p.modules.length} weeks`} icon={ClipboardCheck} gradient="bg-gradient-to-br from-sky-500 to-blue-600" />
        <StatCard
          title="Assignments"
          value={`${p.approvedAssignments}/${p.totalAssignments}`}
          hint={pendingAssignments > 0 ? `${pendingAssignments} pending review` : "all approved"}
          icon={FileText}
          gradient={pendingAssignments > 0 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-emerald-500 to-green-600"}
        />
        <StatCard
          title="Certificate"
          value={certEligibility.eligible ? "Ready" : "In progress"}
          hint={certEligibility.eligible ? "issued on request" : p.percent < 100 ? `${p.percent}% to go` : "complete all steps"}
          icon={Award}
          gradient={certEligibility.eligible ? "bg-gradient-to-br from-emerald-500 to-green-600" : "bg-gradient-to-br from-violet-600 to-indigo-600"}
        />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand-500" /> Program progress
          </CardTitle>
          <CardDescription>Self-paced — complete each week to unlock the next.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Progress value={p.percent} className="flex-1" />
            <span className="text-sm font-bold">{p.percent}%</span>
          </div>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {p.modules.map((m) => {
              const lock = locks[m.id];
              const done = m.order < p.currentWeek;
              return (
                <Link
                  key={m.id}
                  href={lock?.unlocked ? `/student/modules/${m.id}` : "/student/modules"}
                  className="rounded-xl border border-border bg-muted/20 p-3.5 transition-colors hover:border-brand-500/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Week {m.week}</span>
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : !lock?.unlocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold">{m.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.lessons.length} lessons</p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-brand-500" /> Certificate checklist</CardTitle>
            <CardDescription>All four must be done — then your certificate is issued automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: "Payment confirmed & account active", done: p.enrollment.status === "active" },
              { label: "Complete all course videos", done: p.allLessonsDone },
              { label: "Get all assignments approved", done: p.allAssignmentsApproved },
              { label: "Pass the final assessment (70%+)", done: assessmentPassed },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3.5 py-2.5 text-sm">
                {step.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className={step.done ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
              </div>
            ))}
            {certEligibility.eligible && (
              <div className="flex items-center gap-3 rounded-lg bg-success/10 px-3.5 py-3 text-sm font-semibold text-success">
                <PartyPopper className="h-4 w-4 shrink-0" /> You are eligible — claim your certificate!
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Hourglass className="h-4 w-4 text-brand-500" /> Recent announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.length === 0 && (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            )}
            {announcements.map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-muted/20 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{a.title}</p>
                  <span className="text-[10px] text-muted-foreground">{formatDate(a.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={assessmentEligibility.eligible ? "/student/assessment" : "/student/modules"}>
          <Button variant="gradient">Go to final assessment <ArrowRight className="h-4 w-4" /></Button>
        </Link>
        <Link href="/student/certificate">
          <Button variant="outline">View certificate</Button>
        </Link>
      </div>
    </DashboardShell>
  );
}
