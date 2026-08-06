"use client";

import { useEffect, useState } from "react";
import { FolderKanban } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { getSession } from "@/lib/auth";
import { getProjectsForClient } from "@/lib/data/repository";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

export default function ClientProjectsPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const projects = getProjectsForClient(user.id);

  return (
    <DashboardShell>
      <PageHeader title="Projects" description="Track progress, milestones and deliverables across your engagements." />

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-6 w-6" />}
          title="No projects yet"
          description="When we kick off your first project, its timeline and milestones will appear here."
        />
      ) : (
        <div className="space-y-6">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{p.service}</CardDescription>
                </div>
                <Badge variant={p.status === "completed" ? "success" : p.status === "review" ? "warning" : "info"}>
                  {p.status.replace("_", " ")}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <div className="flex items-center gap-3">
                  <Progress value={p.progress} className="flex-1" />
                  <span className="text-sm font-bold">{p.progress}%</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-semibold">{formatCurrency(p.budget)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Started</p>
                    <p className="font-semibold">{formatDate(p.startDate)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">Due</p>
                    <p className="font-semibold">{formatDate(p.dueDate)}</p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Milestones</p>
                  <div className="flex flex-wrap gap-2">
                    {p.milestones.map((m) => (
                      <Badge key={m.title} variant={m.done ? "success" : "outline"}>
                        {m.done ? "✓ " : "○ "}{m.title}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your team</p>
                  <div className="flex -space-x-2">
                    {p.team.map((t) => (
                      <Avatar key={t} name={t === "u_mentor1" ? "Sneha Kulkarni" : t === "u_emp1" ? "Priya Sharma" : "Teja Verma"} className="ring-2 ring-card" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
