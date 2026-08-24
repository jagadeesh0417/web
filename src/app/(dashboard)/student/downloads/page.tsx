"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, FileText, IndianRupee, ArrowRight, FileCode } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getStudentProgress, getModules } from "@/lib/data/repository";
import type { AppUser } from "@/lib/types";

export default function DownloadsPage() {
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
  if (!p.enrollment) {
    return (
      <DashboardShell>
        <PageHeader title="Downloads" description="Offer letter, invoice and study resources." />
        <EmptyState icon={<Download className="h-10 w-10" />} title="No program yet" description="Enroll to access your documents." />
      </DashboardShell>
    );
  }

  const resources = getModules(p.enrollment.categorySlug).flatMap((m) =>
    m.resources.map((r) => ({ ...r, moduleTitle: m.title, week: m.week })),
  );

  return (
    <DashboardShell>
      <PageHeader title="Downloads" description="Your internship documents and study resources." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-brand-500" /> Offer letter</CardTitle>
            <CardDescription>Formal internship offer · prints to PDF</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your signed offer letter with program details, stipend structure and internship dates. Open it and use your browser&apos;s print dialog to save as PDF.
            </p>
            <div className="mt-4">
              <Link href="/student/offer-letter">
                <Button variant="gradient" size="sm"><Download className="h-4 w-4" /> View & download</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><IndianRupee className="h-4 w-4 text-brand-500" /> Payment invoice</CardTitle>
            <CardDescription>Tax receipt for your program fee</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              GST-compliant invoice with order ID, payment method and fee breakdown. Keep it for your records or reimbursement.
            </p>
            <div className="mt-4">
              <Link href="/student/invoice">
                <Button variant="gradient" size="sm"><Download className="h-4 w-4" /> View & download</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><FileCode className="h-4 w-4 text-brand-500" /> Weekly resources & notes</h2>
          <span className="text-xs text-muted-foreground">{resources.length} files</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r, i) => (
            <a key={i} href={`/student/modules?week=${r.week}`} className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand-500/40">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium group-hover:text-brand-500">{r.name}</p>
                <p className="text-xs text-muted-foreground">Week {r.week} · {r.moduleTitle}</p>
              </div>
              <Badge variant="outline">{r.type}</Badge>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Certificate?</strong> Your completion certificate is issued after passing the final assessment —
          find it under{" "}
          <Link href="/student/certificate" className="font-medium text-brand-500 hover:underline">Certificate</Link>.
          <span className="mx-1">·</span>
          <Link href="/student/assessment" className="font-medium text-brand-500 hover:underline">Final assessment <ArrowRight className="inline h-3 w-3" /></Link>
        </p>
      </div>
    </DashboardShell>
  );
}
