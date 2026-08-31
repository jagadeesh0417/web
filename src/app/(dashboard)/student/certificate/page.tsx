"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Award, Lock, CheckCircle2, ArrowRight, Download, Eye, ExternalLink, Loader2, Calendar, Hash } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getCertificateEligibility, getCertificatesByStudent } from "@/lib/data/repository";
import { CertificateView } from "@/components/certificate/certificate-view";
import type { AppUser, Certificate } from "@/lib/types";

export default function CertificatePage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [cert, setCert] = useState<Certificate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  const fetchCertificate = useCallback(async (userId: string) => {
    const existing = getCertificatesByStudent(userId)[0];
    if (existing) {
      setCert(existing);
      return true;
    }
    return false;
  }, []);

  const generateCertificate = useCallback(async (userId: string) => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/internships/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate certificate");
      }

      const result = await response.json();
      if (result.certificate) {
        setCert(result.certificate);
      } else {
        await fetchCertificate(userId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  }, [fetchCertificate]);

  useEffect(() => {
    getSession().then(async ({ user }) => {
      setUser(user);
      setReady(true);

      if (user) {
        const hasExistingCert = await fetchCertificate(user.id);
        if (!hasExistingCert) {
          const eligibility = getCertificateEligibility(user.id);
          if (eligibility.eligible) {
            generateCertificate(user.id);
          }
        }
      }
    });
  }, [fetchCertificate, generateCertificate]);

  const scrollToCertificate = () => {
    certificateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDownload = () => {
    window.print();
  };

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const eligibility = getCertificateEligibility(user.id);

  if (cert) {
    return (
      <DashboardShell>
        <PageHeader
          title="Your Certificate"
          description="Proof of completion · verifiable online"
        />
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={scrollToCertificate}>
            <Eye className="mr-2 h-4 w-4" /> View Certificate
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download Certificate
          </Button>
          <Link href={`/verify-certificate?id=${cert.id}`} target="_blank">
            <Button variant="gradient" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" /> Verify Certificate
            </Button>
          </Link>
        </div>
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono font-medium">Certificate ID: {cert.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Issued: {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div ref={certificateRef}>
          <CertificateView certificate={cert} />
        </div>
      </DashboardShell>
    );
  }

  if (generating) {
    return (
      <DashboardShell>
        <PageHeader title="Certificate" description="Generating your certificate..." />
        <Card>
          <CardContent className="flex flex-col items-center p-10 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
            <h2 className="mt-4 text-xl font-bold">Generating Certificate</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Please wait while we generate your certificate. This may take a moment...
            </p>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <PageHeader title="Certificate" description="There was an issue generating your certificate." />
        <Card>
          <CardContent className="flex flex-col items-center p-10 text-center">
            <Award className="h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-bold">Generation Failed</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
            <Button variant="gradient" className="mt-5" onClick={() => generateCertificate(user.id)}>
              <Award className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

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
              All requirements are complete. Your certificate is being generated automatically.
            </p>
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
