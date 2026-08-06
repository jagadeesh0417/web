"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, Lock, CheckCircle2, ArrowRight, Printer, RefreshCw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getCertificateEligibility, getCertificatesByStudent, issueCertificateForUser } from "@/lib/data/repository";
import { CertificateView } from "@/components/certificate/certificate-view";
import type { AppUser } from "@/lib/types";

export default function CertificatePage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issued, setIssued] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const existing = getCertificatesByStudent(user.id)[0];

  const issue = () => {
    setIssuing(true);
    issueCertificateForUser(user.id, "Akradhii Pvt. Ltd.");
    setTimeout(() => {
      setIssued(true);
      setIssuing(false);
    }, 600);
  };

  if (existing || issued) {
    const cert = existing ?? getCertificatesByStudent(user.id)[0];
    return (
      <DashboardShell>
        <PageHeader
          title="Your Certificate"
          description="Proof of completion · verifiable online"
          actions={
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print / PDF</Button>
          }
        />
        {cert && <CertificateView certificate={cert} />}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Employers can verify this certificate at <span className="font-mono text-brand-500">akradhii.com/verify</span> using its unique ID.
          </p>
          <Link href="/verify" target="_blank">
            <Button variant="gradient" size="sm">See verification page <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const eligibility = getCertificateEligibility(user.id);

  return (
    <DashboardShell>
      <PageHeader title="Certificate" description="Your certificate is issued automatically once you're eligible." />

      {eligibility.eligible ? (
        <Card>
          <CardContent className="flex flex-col items-center p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <Award className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold">You&apos;re eligible!</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              All requirements are complete. Issue your certificate now — it&apos;s instantly verifiable online with a QR code.
            </p>
            <Button variant="gradient" className="mt-5" onClick={issue} loading={issuing}>
              <RefreshCw className="h-4 w-4" /> Issue my certificate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Certificate locked</h3>
                <p className="mt-1 text-sm text-muted-foreground">Complete every step below and your certificate unlocks automatically:</p>
                <ul className="mt-3 space-y-1.5">
                  {eligibility.reasons.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/student/modules"><Button variant="outline" size="sm">Course modules</Button></Link>
                  <Link href="/student/assignments"><Button variant="outline" size="sm">Assignments</Button></Link>
                  <Link href="/student/assessment"><Button variant="gradient" size="sm">Final assessment <ArrowRight className="h-4 w-4" /></Button></Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
