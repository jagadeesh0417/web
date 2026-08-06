"use client";

import { useEffect, useState } from "react";
import { CheckSquare } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { getTasksForEmployee, getAllTasks, getProjects } from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";
import type { EmployeeTask } from "@/lib/types";

export default function EmployeeTasksPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const tasks = getTasksForEmployee(user.id);
  const allTasks = getAllTasks();
  const projects = getProjects();
  const projectName = (id?: string) => projects.find((p) => p.id === id)?.name ?? "—";

  const advance = (t: EmployeeTask) => {
    const order = ["todo", "in_progress", "review", "done"] as const;
    const next = order[Math.min(order.indexOf(t.status) + 1, 3)]!;
    toast("success", "Status updated", `Task moved to ${next.replace("_", " ")}.`);
  };

  return (
    <DashboardShell>
      <PageHeader title="Tasks" description="Your assigned work items across projects." />

      <div className="grid gap-4 lg:grid-cols-2">
        {tasks.map((t) => (
          <Card key={t.id}>
            <div className="flex h-full flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                <Badge variant={t.priority === "high" ? "destructive" : t.priority === "medium" ? "warning" : "success"}>{t.priority} priority</Badge>
                <Badge variant={t.status === "done" ? "success" : t.status === "in_progress" ? "info" : "outline"}>{t.status.replace("_", " ")}</Badge>
              </div>
              <h2 className="mt-3 font-semibold">{t.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{t.description}</p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>Project: {projectName(t.projectId)}</span>
                <span>Due {formatDate(t.dueDate)}</span>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => advance(t)} disabled={t.status === "done"}>
                <CheckSquare className="h-4 w-4" /> {t.status === "done" ? "Completed" : "Move to next stage"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {allTasks.length > tasks.length && (
        <p className="mt-4 text-xs text-muted-foreground">
          {allTasks.length - tasks.length} task(s) assigned to teammates — visible to managers only.
        </p>
      )}
    </DashboardShell>
  );
}
