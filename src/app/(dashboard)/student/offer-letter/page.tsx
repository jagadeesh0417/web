"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, GraduationCap } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { EmptyState } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getStudentProgress } from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

export default function OfferLetterPage() {
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
        <EmptyState icon={<GraduationCap className="h-10 w-10" />} title="No enrollment" description="You need an active enrollment to view your offer letter." />
      </DashboardShell>
    );
  }

  const start = new Date(enrollment.startedAt);
  const end = new Date(start.getTime() + enrollment.durationWeeks * 7 * 86400000);
  const today = formatDate(new Date());

  return (
    <DashboardShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/student/downloads">
          <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Downloads</Button>
        </Link>
        <Button variant="gradient" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Save as PDF</Button>
      </div>

      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none sm:p-12">
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">Akradhii Pvt. Ltd.</p>
            <p className="mt-1 text-xs text-muted-foreground">DIGITAL MARKETING & SOFTWARE SOLUTIONS · IIT & NSDC TRAINED</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Bengaluru, Karnataka · hello@akradhii.com · +91 90000 00000</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Internship Offer Letter</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">Ref: {enrollment.enrollmentId}</p>
            <p className="font-mono text-xs text-muted-foreground">Date: {today}</p>
          </div>
        </div>

        <div className="pt-6 text-sm leading-relaxed text-muted-foreground">
          <p>Dear <strong className="text-foreground">{user.name}</strong>,</p>
          <p className="mt-4">
            Congratulations! Following the review of your application and the successful confirmation of your program fee, we are delighted to offer you the position of
            <strong className="text-foreground"> Intern — {enrollment.programTitle}</strong> at Akradhii Pvt. Ltd.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Program</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{enrollment.programTitle}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Duration</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{enrollment.durationWeeks} weeks (self-paced)</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Start date</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{formatDate(start.toISOString())}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">End date</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{formatDate(end.toISOString())}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Mode</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">Remote · Recorded sessions + projects</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Student ID</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">{enrollment.studentId}</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <p className="font-semibold text-foreground">Terms & conditions</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>This is an unpaid internship for skill development; project-based learning with mentor reviews.</li>
              <li>The internship is completely self-paced. Modules unlock as you complete each week&apos;s videos and assignments.</li>
              <li>A digital certificate of completion is issued after you pass the final assessment (70% or above).</li>
              <li>The certificate can be verified online using its unique ID by any employer.</li>
              <li>Program fee covers content, mentorship, assessment, certification and verification — it is non-refundable once paid.</li>
            </ol>
          </div>

          <p className="mt-6">
            We look forward to an exciting journey. Please reply to this letter or contact support if anything needs clarification.
          </p>
        </div>

        <div className="mt-10 flex items-end justify-between border-t border-border pt-6">
          <div>
            <p className="text-xs text-muted-foreground">For <strong className="text-foreground">Akradhii Pvt. Ltd.</strong></p>
            <p className="mt-8 font-serif text-lg italic text-muted-foreground">Authorised Signatory</p>
            <p className="text-xs text-muted-foreground">HR & Operations · Akradhii Pvt. Ltd.</p>
          </div>
          <div className="text-right text-[11px] text-muted-foreground">
            <p>Offer accepted by: ____________________</p>
            <p className="mt-2">Date: ____________________</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
