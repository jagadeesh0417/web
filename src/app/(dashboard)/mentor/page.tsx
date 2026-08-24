"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ClipboardCheck, Video, Megaphone, ArrowRight, Star } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { getSession } from "@/lib/auth";
import { getSubmissions, getSessions } from "@/lib/data/repository";
import { timeAgo } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

const interns = [
  { id: "u_student", name: "Ananya Gupta", track: "Web Development", program: "Professional (6w)", progress: 62, lastActive: "2h ago", status: "On track" },
  { id: "u_student2", name: "Karthik Rao", track: "UI/UX Design", program: "Foundation (4w)", progress: 84, lastActive: "1d ago", status: "On track" },
  { id: "demo_a9", name: "Nikhil Verma", track: "Web Development", program: "Industry (8w)", progress: 38, lastActive: "3d ago", status: "Needs support" },
  { id: "demo_a8", name: "Sanjana Pillai", track: "Automation", program: "Professional (6w)", progress: 55, lastActive: "5h ago", status: "On track" },
];

export default function MentorDashboard() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const submissions = getSubmissions();
  const pendingReview = submissions.filter((s) => s.status === "submitted" || s.status === "revision").length;
  const sessions = getSessions();

  return (
    <DashboardShell>
      <PageHeader
        title={`Mentor overview, ${user.name.split(" ")[0]}`}
        description="Track your interns, review their work and keep sessions moving."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned interns" value={String(interns.length)} delta={2} deltaLabel="new this cohort" icon={Users} gradient="from-violet-600 to-indigo-600" />
        <StatCard title="Pending reviews" value={String(pendingReview)} delta={-1} deltaLabel="vs yesterday" icon={ClipboardCheck} gradient="from-amber-500 to-orange-600" />
        <StatCard title="Upcoming sessions" value={String(sessions.filter((s) => s.date >= new Date().toISOString().slice(0, 10)).length)} delta={0} deltaLabel="this week" icon={Video} gradient="from-blue-600 to-cyan-500" />
        <StatCard title="Avg intern score" value="84%" delta={4} deltaLabel="vs last cohort" icon={Star} gradient="from-emerald-600 to-teal-500" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>My interns</CardTitle>
              <CardDescription>Live progress across the cohort</CardDescription>
            </div>
            <Link href="/mentor/interns">
              <Button variant="ghost" size="sm">View all <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {interns.slice(0, 4).map((intern) => (
              <div key={intern.id} className="flex items-center gap-4 rounded-xl border border-border p-3.5">
                <Avatar name={intern.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{intern.name}</p>
                    <Badge variant={intern.status === "On track" ? "success" : "warning"}>{intern.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{intern.track} · {intern.program}</p>
                  <Progress value={intern.progress} className="mt-2" />
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-sm font-bold">{intern.progress}%</p>
                  <p className="text-[10px] text-muted-foreground">active {intern.lastActive}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Needs your review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {submissions.slice(0, 4).map((s) => (
                <Link key={s.id} href="/mentor/assignments" className="block rounded-xl border border-border p-3.5 transition-colors hover:border-brand-500/40">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{s.studentId === "u_student" ? "Ananya Gupta" : "Karthik Rao"}</p>
                    <Badge variant={s.status === "submitted" ? "info" : "warning"}>{s.status === "submitted" ? "New submission" : "Revision"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    {s.note ?? "Submitted with links and files."}
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">{timeAgo(s.submittedAt)}</p>
                </Link>
              ))}
              {submissions.length === 0 && <p className="text-sm text-muted-foreground">Nothing pending — all caught up!</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/mentor/announcements"><Button variant="secondary" className="w-full justify-start"><Megaphone className="h-4 w-4" /> Post announcement</Button></Link>
              <Link href="/mentor/sessions"><Button variant="secondary" className="w-full justify-start"><Video className="h-4 w-4" /> Schedule session</Button></Link>
              <Link href="/mentor/messages"><Button variant="secondary" className="w-full justify-start"><ClipboardCheck className="h-4 w-4" /> Message interns</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
