"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MessageCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { getSession } from "@/lib/auth";

interface InternRow {
  id: string;
  name: string;
  email: string;
  track: string;
  progress: number;
  attendance: number;
  status: "On track" | "Needs support" | "At risk";
}

const interns: InternRow[] = [
  { id: "u_student", name: "Ananya Gupta", email: "student@akradhii.com", track: "Web Development", progress: 62, attendance: 86, status: "On track" },
  { id: "u_student2", name: "Karthik Rao", email: "karthik@example.com", track: "UI/UX Design", progress: 84, attendance: 100, status: "On track" },
  { id: "demo_a9", name: "Nikhil Verma", email: "nikhil@example.com", track: "Web Development", progress: 38, attendance: 55, status: "At risk" },
  { id: "demo_a8", name: "Sanjana Pillai", email: "sanjana@example.com", track: "Automation", progress: 55, attendance: 71, status: "Needs support" },
  { id: "demo_a7", name: "Riya Kapoor", email: "riya@example.com", track: "Meta Ads", progress: 91, attendance: 100, status: "On track" },
  { id: "demo_a6", name: "Aditya Rao", email: "aditya@example.com", track: "AI Automation", progress: 47, attendance: 64, status: "Needs support" },
];

export default function MentorInternsPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

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
      key: "track",
      header: "Track",
      cell: (r) => <Badge variant="primary">{r.track}</Badge>,
    },
    {
      key: "progress",
      header: "Progress",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <Progress value={r.progress} className="w-24" />
          <span className="text-xs font-semibold">{r.progress}%</span>
        </div>
      ),
    },
    {
      key: "attendance",
      header: "Attendance",
      cell: (r) => <span className={r.attendance >= 75 ? "text-success" : "text-warning"}>{r.attendance}%</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <Badge variant={r.status === "On track" ? "success" : r.status === "Needs support" ? "warning" : "destructive"}>
          {r.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Link href={`/mentor/interns/${r.id}`} className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> View
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <Link href="/mentor/messages" aria-label="Message"><MessageCircle className="h-4 w-4" /></Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell>
      <PageHeader title="My interns" description="Overview of assigned interns — progress, attendance and status." />
      <DataTable
        data={interns}
        columns={columns}
        searchPlaceholder="Search interns…"
        searchKeys={["name", "email", "track"]}
        filters={[
          { label: "Status", options: ["On track", "Needs support", "At risk"] },
          { label: "Track", options: ["Web Development", "UI/UX Design", "Automation", "Meta Ads", "AI Automation"] },
        ]}
        filterRows={(r, fv) =>
          (fv.Status === "all" || !fv.Status || r.status === fv.Status) &&
          (fv.Track === "all" || !fv.Track || r.track === fv.Track)
        }
      />
    </DashboardShell>
  );
}
