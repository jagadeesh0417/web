"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Award, BookOpen, ClipboardCheck, FileText, Hourglass,
  CheckCircle2, XCircle, FolderKanban, Clock, RefreshCw, ExternalLink, Play,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/progress";
import { formatDate, timeAgo } from "@/lib/utils";

interface DashboardData {
  user: { id: string; name: string; email: string; role: string };
  enrollment: {
    programTitle?: string;
    durationWeeks?: number;
    status?: string;
    startedAt?: string;
    categorySlug?: string;
    [key: string]: unknown;
  } | null;
  certEligibility: { eligible: boolean; reasons: string[] };
  assessmentPassed: boolean;
  progress: {
    overall?: {
      percent?: number;
      completedLessons?: number;
      totalLessons?: number;
      approvedAssignments?: number;
      totalAssignments?: number;
      currentWeek?: number;
      allLessonsDone?: boolean;
      allAssignmentsApproved?: boolean;
    };
    modules?: Array<{
      id: string;
      title: string;
      description?: string;
      week?: number;
      lessonsDone?: number;
      lessonsTotal?: number;
      lessons?: Array<{ id: string; title: string }>;
      completed?: boolean;
      assignmentApproved?: boolean;
    }>;
  };
  notifications: Record<string, unknown>[];
  announcements: Record<string, unknown>[];
  certificate: Record<string, unknown> | null;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-40 w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="130" height="130" className="-rotate-90">
        <circle
          cx="65" cy="65" r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted"
        />
        <circle
          cx="65" cy="65" r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold tracking-tight">{percent}%</span>
        <span className="text-xs text-muted-foreground">Complete</span>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, progressRes, notifRes, certRes] = await Promise.all([
        fetch("/api/student/me"),
        fetch("/api/student/progress"),
        fetch("/api/student/notifications"),
        fetch("/api/student/certificate"),
      ]);

      if (!meRes.ok) throw new Error("Failed to load user data");

      const me = await meRes.json();
      const progress = await progressRes.json();
      const notifs = await notifRes.json();
      const cert = await certRes.json();

      setData({
        user: me.user,
        enrollment: me.enrollment,
        certEligibility: me.certEligibility,
        assessmentPassed: me.assessmentPassed,
        progress,
        notifications: notifs.notifications,
        announcements: notifs.announcements,
        certificate: cert.certificate,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  if (!data.enrollment) {
    return (
      <div>
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
      </div>
    );
  }

  const p = data.progress;
  const overall = p.overall ?? {};
  const enrollment = data.enrollment!;
  const pendingTasks = (overall.totalAssignments ?? 0) - (overall.approvedAssignments ?? 0);
  const completedProjects = p.modules?.filter((m) => m.assignmentApproved).length ?? 0;

  const certStatus = data.certificate
    ? "Issued"
    : data.certEligibility.eligible
      ? "Eligible"
      : "In Progress";

  const currentModule = p.modules?.[Math.min((overall.currentWeek ?? 1) - 1, (p.modules?.length ?? 1) - 1)];

  const upcomingDeadlines: Array<Record<string, unknown>> = [];
  const recentActivity: Array<{ title: string; status: unknown; date: unknown }> = [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {data.user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-violet-100">
          {enrollment.programTitle} · {enrollment.durationWeeks}-week program
        </p>
      </div>

      {/* Progress + Stats Row */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Progress Ring */}
        <Card className="flex flex-col items-center justify-center p-6 lg:col-span-1">
          <ProgressRing percent={overall.percent ?? 0} />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Overall Progress</p>
          <p className="text-xs text-muted-foreground">
            {overall.completedLessons ?? 0}/{overall.totalLessons ?? 0} lessons
          </p>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
          <StatCard
            title="Current Module"
            value={`Week ${overall.currentWeek ?? 1}`}
            hint={currentModule?.title ?? "Loading..."}
            icon={BookOpen}
            gradient="bg-gradient-to-br from-violet-600 to-indigo-600"
          />
          <StatCard
            title="Pending Tasks"
            value={String(pendingTasks)}
            hint={pendingTasks > 0 ? "need completion" : "all done"}
            icon={FileText}
            gradient={pendingTasks > 0 ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-emerald-500 to-green-600"}
          />
          <StatCard
            title="Completed Projects"
            value={String(completedProjects)}
            hint="approved submissions"
            icon={FolderKanban}
            gradient="bg-gradient-to-br from-sky-500 to-blue-600"
          />
        </div>
      </div>

      {/* Continue Learning + Certificate Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-4 w-4 text-violet-500" /> Continue Learning
            </CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            {currentModule ? (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="info" className="mb-2 text-[10px]">
                      Week {currentModule.week}
                    </Badge>
                    <h3 className="font-semibold">{currentModule.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {currentModule.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {currentModule.lessons?.length ?? 0} lessons
                    </p>
                  </div>
                </div>
                <Link href={`/student/modules/${currentModule.id}`}>
                  <Button variant="gradient" className="mt-4" size="sm">
                    Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No modules available yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-violet-500" /> Certificate Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                {data.certificate ? (
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                ) : data.certEligibility.eligible ? (
                  <Award className="h-5 w-5 text-warning shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div>
                  <p className="text-sm font-semibold">{certStatus}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.certificate
                      ? "Issued on " + formatDate(data.certificate.issuedAt as string)
                      : data.certEligibility.eligible
                        ? "Ready to claim"
                        : "Complete all requirements"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Lessons completed", done: overall.allLessonsDone },
                  { label: "Assignments approved", done: overall.allAssignmentsApproved },
                  { label: "Assessment passed", done: data.assessmentPassed },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {step.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span className={step.done ? "text-foreground" : "text-muted-foreground"}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/student/certificate">
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Certificate
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Internship Info + Upcoming Deadlines */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-violet-500" /> Internship Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Program", value: enrollment.programTitle },
                { label: "Duration", value: `${enrollment.durationWeeks} weeks` },
                { label: "Start Date", value: formatDate(enrollment.startedAt ?? "") },
                { label: "Status", value: enrollment.status, isBadge: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3.5 py-2.5">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  {item.isBadge ? (
                    <Badge variant={enrollment.status === "active" ? "success" : "warning"}>
                      {enrollment.status === "active" ? "Active" : enrollment.status}
                    </Badge>
                  ) : (
                    <span className="text-sm font-medium">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
            <Link href="/student/internship">
              <Button variant="outline" size="sm" className="w-full mt-4">
                View Internship <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-violet-500" /> Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No pending deadlines. Great work!
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines</p>
                ) : upcomingDeadlines.map((sub) => (
                  <div key={String(sub.id ?? Math.random())} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3.5 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{String(sub.assignmentTitle ?? "Task")}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(sub.submittedAt as string)}</p>
                    </div>
                    <Badge variant={sub.status === "revision" ? "warning" : "info"}>
                      {String(sub.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + Quick Links */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-violet-500" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No recent activity yet. Start learning!
              </p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((act, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3.5 py-2.5">
                    {act.status === "approved" ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    ) : act.status === "revision" ? (
                      <XCircle className="h-4 w-4 text-warning shrink-0" />
                    ) : (
                      <Clock className="h-4 w-4 text-info shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{act.title}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(act.date as string)}</p>
                    </div>
                    <Badge
                      variant={
                        act.status === "approved"
                          ? "success"
                          : act.status === "revision"
                            ? "warning"
                            : "info"
                      }
                    >
                      {String(act.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { href: "/student/assessment", label: "Final Assessment", icon: ClipboardCheck },
                { href: "/student/certificate", label: "Certificate", icon: Award },
                { href: "/student/support", label: "Support", icon: FileText },
                { href: "/student/timeline", label: "Timeline", icon: Clock },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-3.5 py-2.5 text-sm font-medium transition-colors hover:border-violet-500/40"
                >
                  <link.icon className="h-4 w-4 text-violet-500" />
                  {link.label}
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      {data.announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-violet-500" /> Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.announcements.slice(0, 3).map((a: Record<string, unknown>, i: number) => (
                <div key={String(a.id ?? i)} className="rounded-lg border border-border bg-muted/20 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{String(a.title ?? "")}</p>
                    <span className="text-[10px] text-muted-foreground">{formatDate(a.createdAt as string)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{String(a.body ?? "")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GraduationCap({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  );
}
