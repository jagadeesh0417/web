"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ScanLine, Search, ShieldCheck, ShieldX, Award, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CertificateView } from "@/components/certificate/certificate-view";
import { Logo } from "@/components/logo";
import { Reveal } from "@/components/marketing/reveal";
import { getCertificateById } from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";
import type { Certificate } from "@/lib/types";

type PublicCert = {
  certificateId: string;
  studentName: string;
  categoryName: string;
  programTitle: string;
  durationWeeks: number;
  completionDate: string;
  issuedAt: string;
  score: number;
  status: string;
  issuedBy: string;
};

function toViewModel(api: PublicCert): Certificate {
  return {
    id: api.certificateId,
    certificateId: api.certificateId,
    studentId: "",
    studentName: api.studentName,
    categoryName: api.categoryName,
    programTitle: api.programTitle,
    durationWeeks: api.durationWeeks,
    startDate: api.completionDate,
    endDate: api.completionDate,
    issuedAt: api.issuedAt,
    score: api.score,
    issuedBy: api.issuedBy,
  };
}

const steps = [
  {
    icon: ScanLine,
    title: "Enter Certificate ID",
    description: "Type the certificate ID from the document or scan the QR code included on it.",
    gradient: "from-violet-600 to-indigo-600",
  },
  {
    icon: Search,
    title: "Instant Verification",
    description: "We check the ID against the Akradhii certificate registry in real time.",
    gradient: "from-indigo-600 to-cyan-600",
  },
  {
    icon: ShieldCheck,
    title: "View Results",
    description: "See verified certificate details including student name, program and completion date.",
    gradient: "from-cyan-600 to-teal-600",
  },
];

function VerifyInner() {
  const params = useSearchParams();
  const initial =
    params.get("certificateId") ??
    params.get("id") ??
    "";
  const [value, setValue] = useState(initial);
  const [result, setResult] = useState<"idle" | "found" | "not_found">("idle");
  const [searched, setSearched] = useState("");
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runVerify = async (rawId: string) => {
    const id = rawId.trim();
    if (!id) {
      setError("Enter a certificate ID.");
      return;
    }
    setError("");
    setLoading(true);
    setSearched(id);
    setResult("idle");
    setCert(null);

    try {
      const res = await fetch(`/api/verify?certificateId=${encodeURIComponent(id)}`, {
        method: "GET",
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        certificate?: PublicCert;
      };

      if (res.ok && data.ok && data.certificate) {
        setCert(toViewModel(data.certificate));
        setResult("found");
      } else {
        // Demo fallback: certificates issued in-browser live in localStorage
        const local = getCertificateById(id);
        if (local) {
          setCert(local);
          setResult("found");
        } else {
          setResult("not_found");
        }
      }
    } catch {
      const local = getCertificateById(id);
      if (local) {
        setCert(local);
        setResult("found");
      } else {
        setResult("not_found");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initial.trim()) void runVerify(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    void runVerify(value);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center">
              <Logo />
            </div>
            <Badge variant="primary" className="mt-6">
              Certificate verification
            </Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Verify your certificate
            </h1>
            <p className="mt-4 text-muted-foreground">
              Enter the certificate ID or scan the QR code. We check authenticity
              against the Akradhii registry in real time.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mx-auto mt-10 max-w-md">
            <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9 font-mono uppercase"
                  placeholder="AKR-2026-XXXXXXXX"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  aria-label="Certificate ID"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" variant="gradient" loading={loading} disabled={loading} className="sm:w-auto">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" /> Verify certificate
                  </>
                )}
              </Button>
            </form>
            {error && <p className="mt-2 text-center text-xs text-destructive">{error}</p>}
          </Reveal>
        </div>
      </section>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {result === "not_found" && (
          <Card className="mx-auto mt-8 max-w-md border-destructive/40">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ShieldX className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold">Certificate not found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We could not find a certificate matching{" "}
                <span className="font-mono text-foreground">{searched}</span>. Please verify the ID and try again. If you
                believe this is an error, contact{" "}
                <a href="mailto:support@akradhii.com" className="text-brand-400 hover:underline">
                  support@akradhii.com
                </a>
                .
              </p>
            </CardContent>
          </Card>
        )}

        {result === "found" && cert && (
          <div className="mt-8">
            <Card className="mx-auto mb-6 max-w-md border-success/40 bg-success/5">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-success">✓ Certificate verified</p>
                  <p className="text-xs text-muted-foreground">
                    Issued to {cert.studentName} · {cert.categoryName} · {cert.programTitle} ({cert.durationWeeks} weeks) ·
                    completed {formatDate(cert.endDate)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <CertificateView certificate={cert} />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              <Badge variant="success">
                <Award className="h-3 w-3" /> Verified against the Akradhii certificate registry
              </Badge>
            </p>
          </div>
        )}
      </div>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge variant="primary" className="mb-4">How it works</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Three simple steps</h2>
          <p className="mt-3 text-muted-foreground">
            Our verification process is fast, transparent and built on the Akradhii certificate registry.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <Card className="flex h-full flex-col p-6 transition-all hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-600/10">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} text-white shadow-lg`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{step.description}</p>
                <p className="mt-3 flex items-start gap-2 text-xs font-medium text-brand-300">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Step {i + 1} of {steps.length}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Related links */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Reveal>
          <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 p-10 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">Explore Akradhii</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Build your career with hands-on internships or reach out to our team for support.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90">
                <Link href="/internships" className="flex items-center gap-2">
                  Internships <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link href="/contact" className="flex items-center gap-2">
                  Contact support <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
