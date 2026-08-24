"use client";

import { QRCodeSVG } from "qrcode.react";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/utils";
import type { Certificate } from "@/lib/types";

export function CertificateView({ certificate }: { certificate: Certificate }) {
  const verifyUrl = `${siteConfig.url}/verify?certificateId=${certificate.certificateId}`;
  return (
    <div className="certificate-sheet relative overflow-hidden rounded-2xl border-2 border-brand-500/40 bg-card">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative p-8 sm:p-12">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">Akradhii Digital Growth Studio</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Certificate of Completion</h1>
          </div>
          <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-black text-white sm:flex">
            A
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">This certificate is proudly presented to</p>
        <p className="mt-3 text-3xl font-extrabold text-gradient sm:text-4xl">{certificate.studentName}</p>

        <div className="mx-auto my-8 h-px w-2/3 bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" />

        <p className="text-sm leading-relaxed text-muted-foreground">
          for successfully completing the{" "}
          <span className="font-semibold text-foreground">{certificate.programTitle}</span> in{" "}
          <span className="font-semibold text-foreground">{certificate.categoryName}</span>, a{" "}
          {certificate.durationWeeks}-week structured internship at Akradhii, with a performance score of{" "}
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

        <div className="mt-8 flex items-end justify-between">
          <div>
            <p className="font-serif text-xl italic text-foreground">Akradhii</p>
            <div className="mt-1 h-px w-40 bg-foreground/40" />
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">Digital signature</p>
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
  );
}
