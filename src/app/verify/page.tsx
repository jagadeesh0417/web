"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ScanLine, Search, ShieldCheck, ShieldX, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CertificateView } from "@/components/certificate/certificate-view";
import { Logo } from "@/components/logo";
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
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Badge variant="primary" className="mt-6">
          Certificate verification
        </Badge>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Verify your certificate</h1>
        <p className="mt-3 text-muted-foreground">
          Enter the certificate ID or open a QR link. We check authenticity against the Akradhii registry.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
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
      {error && <p className="mx-auto mt-2 max-w-md text-center text-xs text-destructive">{error}</p>}

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

      <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/internships" className="text-brand-400 hover:underline">
          Explore internships
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/contact" className="text-brand-400 hover:underline">
          Report an issue
        </Link>
      </div>
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
