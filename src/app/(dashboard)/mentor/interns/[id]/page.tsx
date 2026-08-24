"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, GraduationCap, FileText, Award } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { getSession } from "@/lib/auth";
import { getAssignments, getSubmissions, getSessions, getAttendance } from "@/lib/data/repository";
import { percent, formatDate } from "@/lib/utils";

const internNames: Record<string, { name: string; email: string; college: string; track: string }> = {
  u_student: { name: "Ananya Gupta", email: "student@akradhii.com", college: "Osmania University", track: "Web Development" },
  u_student2: { name: "Karthik Rao", email: "karthik@example.com", college: "VIT Vellore", track: "UI/UX Design" },
  demo_a9: { name: "Nikhil Verma", email: "nikhil@example.com", college: "BITS Pilani", track: "Web Development" },
  demo_a8: { name: "Sanjana Pillai", email: "sanjana@example.com", college: "Anna University", track: "Automation" },
};

export default function MentorInternDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const intern = internNames[id as keyof typeof internNames];
  if (!intern) return notFound();

  const assignments = getAssignments();
  const submissions = getSubmissions(id);
  const sessions = getSessions();
  const attendance = getAttendance(id);
  const present = attendance.filter((a) => a.status === "present").length;
  const attendanceRate = percent(present, sessions.length);
  const approved = submissions.filter((s) => s.status === "approved").length;
  const progress = Math.round((approved / Math.max(1, assignments.length)) * 100);

  return (
    <DashboardShell>
      <Button variant="ghost" size="sm" className="mb-4">
        <Link href="/mentor/interns" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> All interns
        </Link>
      </Button>

      <PageHeader title={intern.name} description={`${intern.track} · ${intern.college}`} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit p-6">
          <div className="flex items-center gap-4">
            <Avatar name={intern.name} className="h-16 w-16 text-lg" />
            <div>
              <h2 className="font-bold">{intern.name}</h2>
              <p className="text-xs text-muted-foreground">{intern.email}</p>
              <Badge variant="success" className="mt-2">Active intern</Badge>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>Overall progress</span><span className="font-bold text-foreground">{progress}%</span></div>
              <Progress value={progress} className="mt-1.5" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>Attendance</span><span className="font-bold text-foreground">{attendanceRate}%</span></div>
              <Progress value={attendanceRate} indicatorClassName="bg-gradient-to-r from-emerald-500 to-teal-400" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-lg font-bold">{approved}/{assignments.length}</p>
                <p className="text-[10px] text-muted-foreground">assignments approved</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-lg font-bold">{present}/{sessions.length}</p>
                <p className="text-[10px] text-muted-foreground">sessions attended</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-brand-500" /> Assignment submissions</CardTitle>
              <CardDescription>Review and grade from the Review Work page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {assignments.map((a) => {
                const sub = submissions.find((s) => s.assignmentId === a.id);
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub ? `Submitted ${formatDate(sub.submittedAt)}` : "Not submitted"}
                      </p>
                    </div>
                    <Badge variant={!sub ? "outline" : sub.status === "approved" ? "success" : sub.status === "revision" ? "warning" : "info"}>
                      {!sub ? "Missing" : sub.status}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-brand-500" /> Certification eligibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Attendance ≥ 75%", ok: attendanceRate >= 75 },
                  { label: "All assignments approved", ok: approved === assignments.length },
                  { label: "Final project approved", ok: false },
                ].map((c) => (
                  <div key={c.label} className={`rounded-lg border p-3 text-center text-sm ${c.ok ? "border-success/40 text-success" : "border-border text-muted-foreground"}`}>
                    <p className="text-xl">{c.ok ? "✓" : "•"}</p>
                    <p className="mt-1 text-xs">{c.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="h-4 w-4 text-brand-500" /> Certificates are issued by admins once all criteria are met.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
