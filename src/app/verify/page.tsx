"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ScanLine, Search, ShieldCheck, ShieldX, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CertificateView } from "@/components/certificate/certificate-view";
import { Logo } from "@/components/logo";
import { getCertificateById } from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";

function VerifyInner() {
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("certificateId") ?? "");
  const [result, setResult] = useState<"idle" | "found" | "not_found">("idle");
  const [searched, setSearched] = useState("");

  const verify = (e?: React.FormEvent) => {
    e?.preventDefault();
    const id = value.trim();
    if (!id) return;
    setSearched(id);
    setResult(getCertificateById(id) ? "found" : "not_found");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Certificate verification</h1>
        <p className="mt-3 text-muted-foreground">
          Enter a certificate ID or scan the QR code on the certificate to verify its authenticity.
        </p>
      </div>

      <form onSubmit={verify} className="mx-auto mt-8 flex max-w-md gap-2">
        <div className="relative flex-1">
          <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 font-mono uppercase"
            placeholder="AKR-2026-XXXXXXXX"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <Button type="submit" variant="gradient">
          <Search className="h-4 w-4" /> Verify
        </Button>
      </form>

      {result === "not_found" && (
        <Card className="mx-auto mt-8 max-w-md border-destructive/40">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldX className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-bold">Certificate not found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No valid certificate matches <span className="font-mono text-foreground">{searched}</span>. If you believe
              this is an error, contact <a href="mailto:support@akradhii.com" className="text-brand-500 hover:underline">support@akradhii.com</a>.
            </p>
          </CardContent>
        </Card>
      )}

      {result === "found" && (() => {
        const cert = getCertificateById(searched)!;
        return (
          <div className="mt-8">
            <Card className="mx-auto mb-6 max-w-md border-success/40 bg-success/5">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-success">This certificate is authentic</p>
                  <p className="text-xs text-muted-foreground">
                    Issued to {cert.studentName} for the {cert.categoryName} {cert.programTitle} ({cert.durationWeeks} weeks),
                    completed {formatDate(cert.endDate)} · score {cert.score}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <CertificateView certificate={cert} />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              <Badge variant="success"><Award className="h-3 w-3" /> Verified against the Akradhii certificate registry</Badge>
            </p>
          </div>
        );
      })()}

      <div className="mt-10 flex justify-center gap-4 text-sm">
        <Link href="/internships" className="text-brand-500 hover:underline">Explore internships</Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/contact" className="text-brand-500 hover:underline">Report an issue</Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}
