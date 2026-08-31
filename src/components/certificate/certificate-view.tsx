"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Certificate } from "@/lib/types";

interface CertificateViewProps {
  certificate: Certificate;
  showActions?: boolean;
}

export function CertificateView({ certificate, showActions = false }: CertificateViewProps) {
  const verifyUrl = `${siteConfig.url}/verify?cert=${certificate.certificateId}`;
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/certificates/${encodeURIComponent(certificate.certificateId)}/download`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = certificate.studentName.replace(/[^a-zA-Z0-9]/g, "_");
      const safeCourse = certificate.categoryName.replace(/[^a-zA-Z0-9]/g, "_");
      a.download = `${safeName}-${safeCourse}-Certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    setSharing(true);
    const msg = encodeURIComponent(
      `🎓 Certificate of Completion\n\n` +
      `I successfully completed the ${certificate.programTitle} in ${certificate.categoryName}.\n\n` +
      `📋 Certificate ID: ${certificate.certificateId}\n` +
      `📊 Score: ${certificate.score}%\n\n` +
      `Verify my certificate: ${verifyUrl}`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    setTimeout(() => setSharing(false), 1000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = verifyUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      {showActions && (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="gradient" size="sm" onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : downloaded ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {downloaded ? "Downloaded" : "Download PDF"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareWhatsApp} disabled={sharing}>
            <Share2 className="mr-2 h-4 w-4" /> Share on WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <ExternalLink className="mr-2 h-4 w-4" /> Copy verify link
          </Button>
        </div>
      )}

      {/* Certificate card */}
      <div className="certificate-sheet relative overflow-hidden rounded-2xl border-2 border-brand-500/40 bg-card">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="relative p-8 sm:p-12">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">
                {siteConfig.name} {siteConfig.tagline}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Certificate of Completion</h1>
            </div>
            <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-black text-white sm:flex">
              {siteConfig.name.charAt(0)}
            </div>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">This certificate is proudly presented to</p>
          <p className="mt-3 text-3xl font-extrabold text-gradient sm:text-4xl">{certificate.studentName}</p>

          <div className="mx-auto my-8 h-px w-2/3 bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />

          <p className="text-sm leading-relaxed text-muted-foreground">
            for successfully completing the{" "}
            <span className="font-semibold text-foreground">{certificate.programTitle}</span> in{" "}
            <span className="font-semibold text-foreground">{certificate.categoryName}</span>, a{" "}
            {certificate.durationWeeks}-week structured internship at {siteConfig.name}, with a performance score of{" "}
            <span className="font-semibold text-foreground">{certificate.score}%</span>.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Duration</p>
              <p className="mt-1 text-sm font-semibold">{certificate.durationWeeks} weeks</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Completed</p>
              <p className="mt-1 text-sm font-semibold">{formatDate(certificate.endDate)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Certificate ID</p>
              <p className="mt-1 text-sm font-mono font-semibold">{certificate.certificateId}</p>
            </div>
          </div>

          {certificate.status === "revoked" && (
            <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-center">
              <Badge variant="destructive">REVOKED — This certificate is no longer valid</Badge>
            </div>
          )}

          <div className="mt-8 flex items-end justify-between">
            <div>
              <p className="font-serif text-xl italic text-foreground">{siteConfig.name}</p>
              <div className="mt-1 h-px w-40 bg-foreground/40" />
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Authorized Signatory</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="rounded-xl border border-border bg-white p-2">
                <QRCodeSVG value={verifyUrl} size={88} level="M" />
              </div>
              <p className="text-[9px] text-muted-foreground">Scan to verify</p>
            </div>
          </div>

          <p className="mt-6 border-t border-border pt-4 text-center text-[10px] text-muted-foreground">
            Verify authenticity at {verifyUrl} · Issued by {certificate.issuedBy} on {formatDate(certificate.issuedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
