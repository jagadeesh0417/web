"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, CalendarRange, IndianRupee, FileText, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getStudentProgress, getPaymentForEnrollment } from "@/lib/data/repository";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

export default function MyInternshipPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const p = getStudentProgress(user.id);
  const enrollment = p.enrollment;

  if (!enrollment) {
    return (
      <DashboardShell>
        <PageHeader title="My Internship" description="Your program at a glance." />
        <EmptyState
          icon={<GraduationCap className="h-10 w-10" />}
          title="No active enrollment"
          description="Complete payment through the application flow to start your internship."
          action={
            <Link href="/internships">
              <Button variant="gradient">Apply now</Button>
            </Link>
          }
        />
      </DashboardShell>
    );
  }

  const payment = getPaymentForEnrollment(enrollment.paymentId);
  const start = new Date(enrollment.startedAt);
  const end = new Date(start.getTime() + enrollment.durationWeeks * 7 * 86400000);

  return (
    <DashboardShell>
      <PageHeader
        title="My Internship"
        description="Your enrollment, payment and program timeline."
        actions={
          <Badge variant={enrollment.status === "active" ? "success" : "warning"}>
            {enrollment.status === "active" ? "Active" : "Pending verification"}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-brand-500" /> {enrollment.programTitle}</CardTitle>
            <CardDescription>Student ID · {enrollment.studentId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Enrollment ID</p>
                <p className="mt-1 font-mono text-sm font-bold">{enrollment.enrollmentId}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Invoice</p>
                <p className="mt-1 font-mono text-sm font-bold">{enrollment.invoiceNumber}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Program fee</p>
                <p className="mt-1 text-sm font-bold">{formatCurrency(enrollment.price)} <span className="text-xs font-normal text-muted-foreground">· {payment?.method ?? "upi"}</span></p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Duration</p>
                <p className="mt-1 text-sm font-bold">{enrollment.durationWeeks} weeks · self-paced</p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-success/10 p-4 text-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="font-semibold text-success">Payment confirmed</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Order {payment?.orderId ?? "—"} · {formatCurrency(enrollment.price)} paid via {payment?.provider ?? "razorpay"} on {payment ? formatDate(payment.createdAt) : formatDate(enrollment.startedAt)}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarRange className="h-4 w-4 text-brand-500" /> Timeline</CardTitle>
            <CardDescription>Joining → expected completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { label: "Joining date", value: formatDate(start.toISOString()), done: true },
                { label: "Account activated", value: enrollment.joinedAt ? formatDate(enrollment.joinedAt) : "—", done: Boolean(enrollment.joinedAt) },
                { label: "All weeks complete", value: p.allLessonsDone && p.allAssignmentsApproved ? "Done" : "In progress", done: p.allLessonsDone && p.allAssignmentsApproved },
                { label: "Expected completion", value: formatDate(end.toISOString()), done: false },
              ].map((item, i) => (
                <div key={item.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${item.done ? "border-success bg-success text-white" : "border-muted-foreground/40"}`}>
                      {item.done && <CheckCircle2 className="h-3 w-3" />}
                    </span>
                    {i < 3 && <span className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/student/offer-letter">
          <Button variant="outline"><FileText className="h-4 w-4" /> View offer letter</Button>
        </Link>
        <Link href="/student/invoice">
          <Button variant="outline"><IndianRupee className="h-4 w-4" /> View invoice</Button>
        </Link>
        <Link href="/student/modules">
          <Button variant="gradient">Continue learning <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>
    </DashboardShell>
  );
}
