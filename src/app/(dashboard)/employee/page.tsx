"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckSquare, Clock, FolderKanban, ArrowUpRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { getSession } from "@/lib/auth";
import { getTasksForEmployee, getTimesheetsForEmployee, getProjects } from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

export default function EmployeeDashboard() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const tasks = getTasksForEmployee(user.id);
  const timesheets = getTimesheetsForEmployee(user.id);
  const projects = getProjects().filter((p) => p.team.includes(user.id));
  const openTasks = tasks.filter((t) => t.status !== "done").length;
  const hoursThisWeek = timesheets.filter((t) => t.approved).reduce((a, t) => a + t.hours, 0);

  return (
    <DashboardShell>
      <PageHeader
        title={`Good day, ${user.name.split(" ")[0]}`}
        description="Your tasks, timesheets and projects at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Open tasks" value={String(openTasks)} delta={-2} deltaLabel="vs yesterday" icon={CheckSquare} gradient="from-violet-600 to-indigo-600" />
        <StatCard title="Hours logged" value={`${hoursThisWeek}h`} delta={8} deltaLabel="vs last week" icon={Clock} gradient="from-amber-500 to-orange-600" />
        <StatCard title="Active projects" value={String(projects.length)} delta={0} deltaLabel="assigned to you" icon={FolderKanban} gradient="from-blue-600 to-cyan-500" />
        <StatCard title="Completion rate" value="87%" delta={3} deltaLabel="this sprint" icon={ArrowUpRight} gradient="from-emerald-600 to-teal-500" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>My tasks</CardTitle>
              <CardDescription>Prioritized by due date</CardDescription>
            </div>
            <Link href="/employee/tasks"><Button variant="ghost" size="sm">View all <ArrowUpRight className="h-4 w-4" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${t.priority === "high" ? "bg-destructive" : t.priority === "medium" ? "bg-warning" : "bg-success"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">due {formatDate(t.dueDate)}</p>
                </div>
                <Badge variant={t.status === "done" ? "success" : t.status === "in_progress" ? "info" : "warning"}>
                  {t.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent timesheets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {timesheets.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.projectName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{t.hours}h</span>
                    <Badge variant={t.approved ? "success" : "warning"}>{t.approved ? "Approved" : "Pending"}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{p.name}</p>
                    <span className="text-xs font-bold">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="mt-2" />
                  <div className="mt-2 flex items-center gap-2">
                    {p.team.map((t) => <Avatar key={t} name={t === "u_mentor1" ? "Sneha Kulkarni" : t === "u_emp1" ? "Priya Sharma" : "Teja Verma"} className="h-6 w-6 text-[9px]" />)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
