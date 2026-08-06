"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { getSession, demoGetAllUsers } from "@/lib/auth";
import { getEnrollments, getStudentProgress } from "@/lib/data/repository";
import { demoData } from "@/lib/data/sample-data";
import { formatDate } from "@/lib/utils";

interface InternRow {
  id: string;
  studentId: string;
  name: string;
  email: string;
  program: string;
  progress: number;
  status: string;
  joinedAt: string;
}

export default function AdminInternsPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  const studentIndex = useMemo(() => {
    const map: Record<string, { name: string; email: string }> = {};
    for (const u of demoData.demoUsers) map[u.id] = { name: u.name, email: u.email };
    for (const u of demoGetAllUsers()) if (!map[u.id]) map[u.id] = { name: u.name, email: u.email };
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const interns: InternRow[] = getEnrollments().map((e) => {
    const p = getStudentProgress(e.userId);
    const student = studentIndex[e.userId];
    return {
      id: e.id,
      studentId: e.studentId,
      name: student?.name ?? "Student",
      email: student?.email ?? e.userId,
      program: e.programTitle,
      progress: p.percent,
      status: e.status === "active" ? (p.allLessonsDone && p.allAssignmentsApproved ? "completed" : "active") : e.status,
      joinedAt: e.joinedAt ?? e.startedAt,
    };
  });

  const columns: Column<InternRow>[] = [
    {
      key: "name",
      header: "Intern",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} />
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "studentId",
      header: "Student ID",
      cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.studentId}</span>,
    },
    {
      key: "program",
      header: "Program",
      cell: (r) => <span className="text-sm">{r.program}</span>,
    },
    {
      key: "progress",
      header: "Progress",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500" style={{ width: `${r.progress}%` }} />
          </div>
          <span className="text-xs font-semibold">{r.progress}%</span>
        </div>
      ),
    },
    {
      key: "joinedAt",
      header: "Joined",
      cell: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.joinedAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <Badge variant={r.status === "completed" ? "success" : r.status === "active" ? "info" : "warning"}>{r.status.replace("_", " ")}</Badge>,
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <Link href={`/admin/students/${r.id}`}>
          <Button variant="ghost" size="sm">Manage</Button>
        </Link>
      ),
    },
  ];

  return (
    <DashboardShell requiredRoles={["admin", "super_admin", "mentor"]}>
      <PageHeader
        title="Interns"
        description="All enrolled interns with live progress from the self-paced workflow."
        actions={<Button variant="outline" size="sm"><GraduationCap className="h-4 w-4" /> Assign mentor</Button>}
      />
      <DataTable
        data={interns}
        columns={columns}
        searchPlaceholder="Search interns…"
        searchKeys={["name", "email", "studentId", "program"]}
        filterRows={(r, fv) =>
          (fv.Status === "all" || !fv.Status || r.status === fv.Status) &&
          (fv.Program === "all" || !fv.Program || r.program === fv.Program)
        }
        filters={[
          { label: "Status", options: ["active", "completed", "pending_verification"] },
          { label: "Program", options: [...new Set(interns.map((i) => i.program))] },
        ]}
      />
    </DashboardShell>
  );
}
