"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, User, Mail, Phone, Building, Calendar, Shield, ShieldOff,
  GraduationCap, CreditCard, Award, BookOpen, ExternalLink, Send,
  FileText, CheckCircle2, Clock, Lock, Globe,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress, Skeleton } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABEL } from "@/lib/rbac";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { Role, Enrollment, Payment, Certificate, Submission, AssessmentAttempt, LessonProgress } from "@/lib/types";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  company?: string;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

interface UserDetailResponse {
  user: UserData;
  enrollments: Enrollment[];
  payments: Payment[];
  certificates: Certificate[];
  submissions: Submission[];
  assessmentAttempts: AssessmentAttempt[];
  lessonProgress: LessonProgress[];
}

const INACTIVE_ROLES = new Set(["guest"]);

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [data, setData] = useState<UserDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const json: UserDetailResponse = await res.json();
      setData(json);
    } catch {
      toast("error", "User not found", "This user doesn't exist or has been removed.");
    } finally {
      setLoading(false);
    }
  }, [params.id, toast]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleToggleStatus = async () => {
    if (!data) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/users/${params.id}/toggle-status`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const { status } = await res.json();
      toast("success", "Status updated", `User is now ${status}.`);
      fetchUser();
    } catch {
      toast("error", "Failed to toggle status", "Please try again.");
    } finally {
      setToggling(false);
    }
  };

  const handleSendEmail = () => {
    toast("info", "Send Email", `Email composer for ${data?.user.email} would open here.`);
  };

  const handleIssueCertificate = () => {
    toast("info", "Issue Certificate", "Certificate issuance workflow would start here.");
  };

  const activeEnrollment = data?.enrollments.find((e) => e.status === "active") ?? data?.enrollments[0] ?? null;
  const latestPayment = data?.payments[0] ?? null;
  const certificate = data?.certificates[0] ?? null;

  const isInactive = data ? INACTIVE_ROLES.has(data.user.role) : false;
  const isActive = data && !isInactive;

  if (loading) {
    return (
      <DashboardShell requiredRoles={["admin", "super_admin", "mentor"]}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!data) {
    return (
      <DashboardShell requiredRoles={["admin", "super_admin", "mentor"]}>
        <PageHeader title="User not found" description="This user doesn't exist." />
      </DashboardShell>
    );
  }

  const { user, enrollments, payments, submissions, assessmentAttempts, lessonProgress } = data;

  const progressPercent = (() => {
    if (!activeEnrollment) return 0;
    const totalLessons = lessonProgress.length;
    const expectedLessons = activeEnrollment.durationWeeks * 3;
    if (expectedLessons === 0) return 0;
    return Math.min(100, Math.round((totalLessons / expectedLessons) * 100));
  })();

  return (
    <DashboardShell requiredRoles={["admin", "super_admin", "mentor"]}>
      <PageHeader
        title={user.name}
        description={`${ROLE_LABEL[user.role]} · ${user.email}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" /> All users
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSendEmail}>
              <Send className="h-4 w-4" /> Send Email
            </Button>
            <Button
              variant={isActive ? "danger" : "success"}
              size="sm"
              onClick={handleToggleStatus}
              loading={toggling}
            >
              {isInactive ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
              {isInactive ? "Activate" : "Deactivate"}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal info card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-brand-500" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
              <Mail className="h-4 w-4 shrink-0 text-brand-500" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Email</p>
                <p className="truncate font-mono text-xs">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
              <Phone className="h-4 w-4 shrink-0 text-brand-500" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Phone</p>
                <p className="text-sm">{user.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
              <Building className="h-4 w-4 shrink-0 text-brand-500" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Company</p>
                <p className="text-sm">{user.company || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
              <Calendar className="h-4 w-4 shrink-0 text-brand-500" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Joined</p>
                <p className="text-sm">{formatDate(user.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
              <Shield className="h-4 w-4 shrink-0 text-brand-500" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Role</p>
                <Badge variant={user.role === "super_admin" || user.role === "admin" ? "primary" : "default"}>
                  {ROLE_LABEL[user.role]}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
              <Globe className="h-4 w-4 shrink-0 text-brand-500" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Email Verified</p>
                <Badge variant={user.emailVerified ? "success" : "warning"}>
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Internship & enrollment card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-brand-500" /> Internship & Enrollment
            </CardTitle>
            <CardDescription>
              {enrollments.length} enrollment{enrollments.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeEnrollment ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Program</p>
                    <p className="mt-1 text-sm font-bold">{activeEnrollment.programTitle}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Student ID</p>
                    <p className="mt-1 font-mono text-sm font-bold">{activeEnrollment.studentId}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                    <p className="mt-1">
                      <Badge variant={activeEnrollment.status === "active" ? "success" : activeEnrollment.status === "completed" ? "info" : "warning"}>
                        {activeEnrollment.status.replace("_", " ")}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Duration</p>
                    <p className="mt-1 text-sm font-medium">{activeEnrollment.durationWeeks} weeks</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Invoice</p>
                    <p className="mt-1 font-mono text-sm font-medium">{activeEnrollment.invoiceNumber}</p>
                  </div>
                </div>
                {enrollments.length > 1 && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">All Enrollments</p>
                    <div className="space-y-2">
                      {enrollments.map((e) => (
                        <div key={e.id} className="flex items-center justify-between text-xs">
                          <span className="font-medium">{e.programTitle}</span>
                          <Badge variant={e.status === "active" ? "success" : "outline"}>{e.status.replace("_", " ")}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No enrollments found for this user.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Payment card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-brand-500" /> Payment Information
            </CardTitle>
            <CardDescription>
              {payments.length} payment{payments.length !== 1 ? "s" : ""} on record
            </CardDescription>
          </CardHeader>
          <CardContent>
            {latestPayment ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{formatCurrency(latestPayment.amount, latestPayment.currency)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {latestPayment.method ? latestPayment.method.toUpperCase() : "—"} · {latestPayment.provider}
                      </p>
                    </div>
                    <Badge variant={latestPayment.status === "succeeded" ? "success" : latestPayment.status === "pending" ? "warning" : "destructive"}>
                      {latestPayment.status}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Order ID</p>
                      <p className="font-mono font-medium">{latestPayment.orderId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Plan</p>
                      <p className="font-medium">{latestPayment.plan}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDateTime(latestPayment.createdAt)}</p>
                    </div>
                    {latestPayment.invoiceNumber && (
                      <div>
                        <p className="text-muted-foreground">Invoice</p>
                        <p className="font-mono font-medium">{latestPayment.invoiceNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
                {payments.length > 1 && (
                  <div className="text-xs text-muted-foreground">
                    + {payments.length - 1} more payment{payments.length - 1 !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payments found for this user.</p>
            )}
          </CardContent>
        </Card>

        {/* Learning progress card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-500" /> Learning Progress
            </CardTitle>
            <CardDescription>
              {activeEnrollment ? `${activeEnrollment.durationWeeks} week program` : "No active enrollment"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeEnrollment ? (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    {progressPercent}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lessonProgress.length} lesson{lessonProgress.length !== 1 ? "s" : ""} completed
                  </span>
                </div>
                <Progress value={progressPercent} />
                {submissions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Recent Submissions</p>
                    {submissions.slice(0, 5).map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs">
                        <span className="flex items-center gap-2 font-medium">
                          {s.status === "approved" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          ) : s.status === "submitted" ? (
                            <Clock className="h-3.5 w-3.5 text-yellow-500" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          {s.links[0] ? <a href={s.links[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.assignmentId}</a> : s.assignmentId}
                        </span>
                        <Badge variant={s.status === "approved" ? "success" : s.status === "submitted" ? "info" : s.status === "revision" ? "warning" : "outline"}>
                          {s.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No learning progress to display.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Assessment attempts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-500" /> Assessment Attempts
            </CardTitle>
            <CardDescription>Max 3 attempts · pass at 70%</CardDescription>
          </CardHeader>
          <CardContent>
            {assessmentAttempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attempts yet.</p>
            ) : (
              <div className="space-y-2">
                {assessmentAttempts.map((a) => (
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

        {/* Certificate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-brand-500" /> Certificate
            </CardTitle>
            <CardDescription>
              {certificate ? certificate.certificateId : "Not yet issued"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {certificate ? (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm font-bold">{certificate.certificateId}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Issued {formatDate(certificate.issuedAt)} · Score {certificate.score}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {certificate.programTitle} · {certificate.durationWeeks} weeks
                    </p>
                  </div>
                  <Link href="/admin/certificates">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Not issued yet — student must finish all weeks and pass the assessment.
                </p>
                {activeEnrollment && activeEnrollment.status === "completed" && (
                  <Button variant="primary" size="sm" onClick={handleIssueCertificate}>
                    <Award className="h-4 w-4" /> Issue Certificate
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
