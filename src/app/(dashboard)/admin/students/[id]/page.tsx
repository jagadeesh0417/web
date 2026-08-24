"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, GraduationCap, Lock, CheckCircle2, Award, IndianRupee, Mail, User } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getSession, demoGetAllUsers } from "@/lib/auth";
import {
  getEnrollmentById, getPaymentForEnrollment, getStudentProgress,
  getAssignmentApproved, getSubmissionByAssignment, getAssessmentAttempts, getCertificatesByStudent,
} from "@/lib/data/repository";
import { demoData } from "@/lib/data/sample-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminStudentDetailPage() {
  const params = useParams<{ id: string }>();
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

  const enrollment = getEnrollmentById(params.id);
  if (!enrollment) {
    return (
      <DashboardShell requiredRoles={["admin", "super_admin", "mentor"]}>
        <PageHeader title="Student not found" description="This enrollment doesn't exist." />
      </DashboardShell>
    );
  }

  const payment = getPaymentForEnrollment(enrollment.paymentId);
  const p = getStudentProgress(enrollment.userId);
  const attempts = getAssessmentAttempts(enrollment.userId);
  const certificate = getCertificatesByStudent(enrollment.userId)[0];
  const student = studentIndex[enrollment.userId];

  return (
    <DashboardShell requiredRoles={["admin", "super_admin", "mentor"]}>
      <PageHeader
        title={student?.name ?? "Student"}
        description={enrollment.programTitle}
        actions={
          <Link href="/admin/interns">
            <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> All interns</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-brand-500" /> Enrollment</CardTitle>
            <CardDescription>Enrollment {enrollment.enrollmentId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Student ID</p>
                <p className="mt-1 font-mono text-sm font-bold">{enrollment.studentId}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Invoice</p>
                <p className="mt-1 font-mono text-sm font-bold">{enrollment.invoiceNumber}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="mt-1"><Badge variant={enrollment.status === "active" ? "success" : "warning"}>{enrollment.status.replace("_", " ")}</Badge></p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                <Mail className="h-4 w-4 shrink-0 text-brand-500" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                  <p className="truncate font-mono text-xs">{student?.email ?? enrollment.userId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4">
                <IndianRupee className="h-4 w-4 shrink-0 text-brand-500" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Paid</p>
                  <p className="text-sm font-bold">{formatCurrency(enrollment.price)} <span className="text-xs font-normal text-muted-foreground">· {payment?.method} · {payment?.orderId}</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-500" /> Progress</CardTitle>
            <CardDescription>Week {p.currentWeek} of {p.modules.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-gradient">{p.percent}%</span>
              <span className="text-xs text-muted-foreground">{p.completedLessons}/{p.totalLessons} lessons · {p.approvedAssignments}/{p.totalAssignments} assignments</span>
            </div>
            <Progress value={p.percent} className="mt-3" />
            <div className="mt-5 space-y-2">
              {p.modules.map((m) => {
                const approved = m.assignmentId ? getAssignmentApproved(m.assignmentId, enrollment.userId) : true;
                const sub = m.assignmentId ? getSubmissionByAssignment(m.assignmentId, enrollment.userId) : undefined;
                return (
                  <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs">
                    <span className="flex items-center gap-2 font-medium">
                      {approved ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                      Week {m.week} · {m.title}
                    </span>
                    <Badge variant={approved ? "success" : sub ? "info" : "outline"}>
                      {approved ? "done" : sub ? sub.status : "locked"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-4 w-4 text-brand-500" /> Final assessment</CardTitle>
            <CardDescription>Max 3 attempts · pass at 70%</CardDescription>
          </CardHeader>
          <CardContent>
            {attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attempts yet.</p>
            ) : (
              <div className="space-y-2">
                {attempts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-2.5 text-sm">
                    <span className="text-xs text-muted-foreground">{formatDate(a.completedAt)}</span>
                    <span className="flex items-center gap-2">
                      <strong>{a.score}/{a.total}</strong>
                      <Badge variant={a.passed ? "success" : "destructive"}>{a.passed ? "Passed" : "Failed"}</Badge>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-4 w-4 text-brand-500" /> Certificate</CardTitle>
            <CardDescription>{enrollment.studentId}</CardDescription>
          </CardHeader>
          <CardContent>
            {certificate ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div>
                  <p className="font-mono text-sm font-bold">{certificate.certificateId}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Issued {formatDate(certificate.issuedAt)} · score {certificate.score}%</p>
                </div>
                <Link href="/admin/certificates"><Button variant="outline" size="sm">View</Button></Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not issued yet — student must finish all weeks and pass the assessment.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
