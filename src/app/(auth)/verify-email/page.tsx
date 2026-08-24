"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { confirmEmailVerified, demoMode, demoGetSession } from "@/lib/auth";
import { homeForRole } from "@/lib/rbac";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const run = async () => {
      await new Promise((r) => setTimeout(r, 1400));
      if (demoMode()) {
        const session = demoGetSession();
        const email = session?.email;
        const ok = email ? await confirmEmailVerified(email) : false;
        if (ok) {
          setVerified(true);
          toast("success", "Email verified", "Welcome to Akradhii!");
          const t = setInterval(() => {
            setCountdown((c) => {
              if (c <= 1) {
                clearInterval(t);
                router.push(homeForRole(session?.role ?? "user"));
              }
              return c - 1;
            });
          }, 1000);
        } else {
          setVerified(false);
          setVerifying(false);
        }
      } else {
        setVerifying(false);
      }
    };
    run();
  }, [router, toast]);

  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-500">
        <MailCheck className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-bold">Verify your email</h1>

      {verifying ? (
        <p className="mt-2 text-sm text-muted-foreground">Checking your verification status…</p>
      ) : verified ? (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Your email is verified. Redirecting to your dashboard in {countdown}s…
          </p>
          <Button variant="gradient" className="mt-6" onClick={() => router.push("/login")}>
            Go to login
          </Button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            A verification link was sent to your inbox. In production this email is delivered via Resend; in demo
            mode verification is automatic.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            {demoMode() && (
              <Button variant="gradient" onClick={() => { setVerifying(true); window.location.reload(); }}>
                I&apos;ve verified — continue
              </Button>
            )}
            <Link href="/login" className="text-sm text-brand-500 hover:underline">
              Back to login
            </Link>
          </div>
        </>
      )}

      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-success" />
        Email verification is required before full access.
      </p>
    </div>
  );
}
