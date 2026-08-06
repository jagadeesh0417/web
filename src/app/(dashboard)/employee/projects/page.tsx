"use client";

import { useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/auth";
import { getProjects } from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";

export default function EmployeeProjectsPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const projects = getProjects().filter((p) => p.team.includes(user.id));

  return (
    <DashboardShell>
      <PageHeader title="Projects" description="Projects you're part of — internal status view." />

      <div className="grid gap-5 lg:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{p.name}</CardTitle>
                <Badge variant={p.status === "completed" ? "success" : p.status === "review" ? "warning" : "info"}>{p.status.replace("_", " ")}</Badge>
              </div>
              <CardDescription>{p.service} · client {p.clientName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Progress value={p.progress} className="flex-1" />
                <span className="text-sm font-bold">{p.progress}%</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.milestones.map((m) => (
                  <Badge key={m.title} variant={m.done ? "success" : "outline"}>{m.done ? "✓ " : "○ "}{m.title}</Badge>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground"><FolderKanban className="h-3.5 w-3.5" /> {formatDate(p.startDate)} → {formatDate(p.dueDate)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
