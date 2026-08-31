"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { siteConfig } from "@/config/site";

function EnrollmentDetails() {
  const params = useSearchParams();

  const applicationId = params.get("applicationId") ?? "—";
  const enrollmentId = params.get("enrollmentId") ?? "—";
  const orderId = params.get("orderId") ?? "—";

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <Reveal>
        <div className="text-center">
          <Badge variant="success" className="mb-3">
            Internship enrollment
          </Badge>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            Enrollment Successful!
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Your payment has been confirmed and your internship enrollment has
            been created. Welcome to the{" "}
            <strong className="text-foreground">{siteConfig.name}</strong>{" "}
            internship program.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Card className="mx-auto mt-10 max-w-2xl overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Enrollment details
            </p>
          </div>
          <div className="grid gap-3 p-6 sm:grid-cols-3">
            {[
              ["Application ID", applicationId],
              ["Enrollment ID", enrollmentId],
              ["Order ID", orderId],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-1 rounded-xl bg-muted/30 px-4 py-3">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="font-mono text-sm font-bold">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mx-auto mt-8 max-w-2xl space-y-4">
          <div className="rounded-xl border border-brand-500/30 bg-brand-600/5 p-5">
            <p className="flex items-center gap-2 font-semibold">
              <Mail className="h-4 w-4 text-brand-500" />
              What happens next?
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Your login information will be shared to your registered email
                address.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                You will receive a payment confirmation email with your invoice.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Your internship offer letter will be sent shortly.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <p className="flex items-center gap-2 font-semibold">
              <Award className="h-4 w-4 text-brand-500" />
              Please note
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please check your inbox and spam/junk folder. If you don&apos;t
              receive your login credentials within a few minutes, contact us at{" "}
              <a
                href={`mailto:${siteConfig.internshipEmail}`}
                className="text-brand-500 underline"
              >
                {siteConfig.internshipEmail}
              </a>
              .
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 pt-4">
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="gradient">
                  Go to Login
                </Button>
              </Link>
              <Link href="/internships">
                <Button variant="outline">Back to Internships</Button>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export function EnrollmentSuccessClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          Loading…
        </div>
      }
    >
      <EnrollmentDetails />
    </Suspense>
  );
}
