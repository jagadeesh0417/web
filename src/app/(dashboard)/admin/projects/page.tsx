"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import { getProjects } from "@/lib/data/repository";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Project } from "@/lib/types";

export default function AdminProjectsPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const projects = getProjects();

  const columns: Column<Project>[] = [
    {
      key: "name",
      header: "Project",
      cell: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.service}</p>
        </div>
      ),
    },
    {
      key: "clientName",
      header: "Client",
      cell: (r) => <span className="text-sm">{r.clientName}</span>,
    },
    {
      key: "budget",
      header: "Budget",
      cell: (r) => <span className="font-semibold">{formatCurrency(r.budget)}</span>,
    },
    {
      key: "progress",
      header: "Progress",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500" style={{ width: `${r.progress}%` }} />
          </div>
          <span className="text-xs font-semibold">{r.progress}%</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <Badge variant={r.status === "completed" ? "success" : r.status === "review" ? "warning" : "info"}>{r.status.replace("_", " ")}</Badge>,
    },
    {
      key: "dueDate",
      header: "Due",
      cell: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.dueDate)}</span>,
    },
  ];

  return (
    <DashboardShell>
      <PageHeader title="Projects" description="All client projects across the studio." />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["In progress", projects.filter((p) => p.status === "in_progress").length, "text-brand-500"],
          ["In review", projects.filter((p) => p.status === "review").length, "text-warning"],
          ["Completed", projects.filter((p) => p.status === "completed").length, "text-success"],
          ["Pipeline value", formatCurrency(projects.reduce((a, p) => a + p.budget, 0)), "text-foreground"],
        ].map(([label, value, cls]) => (
          <Card key={String(label)} className="p-4">
            <p className={`text-2xl font-extrabold ${cls}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      <Card><CardContent className="p-0"><DataTable data={projects} columns={columns} searchPlaceholder="Search projects…" searchKeys={["name", "clientName", "service"]} filterRows={(r, fv) => (fv.Status === "all" || !fv.Status || r.status === fv.Status)} filters={[{ label: "Status", options: ["planning", "in_progress", "review", "completed"] }]} /></CardContent></Card>
    </DashboardShell>
  );
}
