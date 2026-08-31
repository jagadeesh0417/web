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
import { Spinner } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ModuleItem {
  id: string;
  title: string;
  week: number;
  order: number;
  description: string;
  lessonCount: number;
  lessonsDone: number;
  percent: number;
  completed: boolean;
  unlocked: boolean;
  lockReason?: string;
  assignment: { id: string; title: string; submitted: boolean; approved: boolean } | null;
}

interface ModulesResponse {
  modules: ModuleItem[];
  enrollment: { id: string; categorySlug: string; programTitle: string } | null;
}

export default function ModulesPage() {
  const [data, setData] = useState<ModulesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/modules");
      if (!res.ok) throw new Error("Failed to load modules");
      const json = await res.json();
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <PageHeader title="Course Modules" description="Self-paced · complete each week to unlock the next." />
        <div className="flex items-center justify-center py-20"><Spinner /></div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <PageHeader title="Course Modules" description="Self-paced · complete each week to unlock the next." />
        <Card>
          <CardContent className="flex flex-col items-center p-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>Retry</Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  if (!data?.enrollment) {
    return (
      <DashboardShell>
        <PageHeader title="Course Modules" description="Your weekly curriculum." />
        <EmptyState
          icon={<BookOpen className="h-10 w-10" />}
          title="No program yet"
          description="Enroll in an internship to access your modules."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader title="Course Modules" description="Self-paced · complete each week to unlock the next. Only videos you finish unlock the assignment." />

      <div className="space-y-4">
        {data.modules.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold",
                    m.completed ? "bg-success/10 text-success" : m.unlocked ? "bg-brand-600/10 text-brand-500" : "bg-muted text-muted-foreground",
                  )}>
                    {m.completed ? <CheckCircle2 className="h-5 w-5" /> : m.unlocked ? <BookOpen className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={m.unlocked ? "primary" : "outline"}>Week {m.week}</Badge>
                      {m.completed && <Badge variant="success">Completed</Badge>}
                      {!m.completed && m.assignment?.submitted && !m.assignment.approved && <Badge variant="warning">Assignment in review</Badge>}
                    </div>
                    <h3 className="mt-1 font-semibold">{m.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {m.lessonsDone}/{m.lessonCount} lessons watched · {m.assignment ? m.assignment.title : "no assignment"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {m.unlocked ? (
                    <Link href={`/student/modules/${m.id}`}>
                      <Button variant="gradient" size="sm">Open module <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                  ) : (
                    <div className="max-w-[240px] text-right">
                      <p className="flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground">
                        <Lock className="h-3 w-3" /> Locked
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{m.lockReason ?? "Complete the previous week first."}</p>
                    </div>
                  )}
                </div>
              </div>
              {m.unlocked && (
                <Progress value={m.percent} className="mt-4" />
              )}
            </CardContent>
          </Card>
        ))}
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
