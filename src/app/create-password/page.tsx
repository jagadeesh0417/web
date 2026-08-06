"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Lock, ArrowLeft, ShieldCheck, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { passwordSchema } from "@/lib/validators";
import { activatePendingAccount, demoGetPendingAccount } from "@/lib/auth";
import { emailTemplates, sendWorkflowEmail } from "@/lib/notifications";
import { Logo } from "@/components/logo";

function CreatePasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const token = params.get("token") ?? "";
  const [account] = useState(() => (token ? demoGetPendingAccount(token) : null));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const errs: Record<string, string> = {};
    if (!passwordSchema.safeParse(password).success) {
      errs.password = "Min 8 characters with uppercase, lowercase and a number";
    }
    if (password !== confirm) errs.confirm = "Passwords do not match";
    if (password.length < 8) errs.password = errs.password || "Password must be at least 8 characters";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    const res = await activatePendingAccount(token, password);
    if (!res.ok) {
      setErrors({ form: res.error });
      setLoading(false);
      return;
    }
    const accountData = demoGetPendingAccount(token);
    if (accountData) {
      const db = await import("@/lib/data/repository");
      const enrollment = db.getEnrollmentById(accountData.enrollmentDbId);
      if (enrollment) {
        db.activateEnrollment(enrollment.id);
        const t = emailTemplates();
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        await sendWorkflowEmail({
          to: accountData.email,
          subject: "Account activated — welcome to Akradhii",
          template: "welcome",
          html: t.welcome(accountData.name, { programTitle: enrollment.programTitle, dashboardUrl: `${origin}/student` }),
        });
      }
    }
    setLoading(false);
    setDone(true);
    toast("success", "Password created", "Your account is active. Redirecting…");
    setTimeout(() => router.push("/student"), 1400);
  };

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <Logo />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold">Account activated!</h1>
        <p className="max-w-sm text-sm text-muted-foreground">Your internship dashboard is ready. Redirecting you now…</p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Logo />
          <h1 className="mt-6 text-xl font-bold">Link invalid or expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This verification link is invalid or has expired. If you already paid, you can request a new verification link from the application flow.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/internships/apply"><Button variant="outline">Re-apply</Button></Link>
            <Link href="/login"><Button variant="gradient">Go to login</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/10 text-brand-500">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Create your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Almost done, <strong className="text-foreground">{account.name}</strong>. Set a password for your student account{" "}
          <span className="font-mono text-xs">{account.email}</span> — your dashboard unlocks immediately.
        </p>
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
          <ShieldCheck className="h-4 w-4" /> Student ID {account.studentId} · enrollment verified
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Field label="New password" error={errors.password} hint="Min 8 characters with uppercase, lowercase and a number.">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </Field>
          <Field label="Confirm password" error={errors.confirm}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="password" className="pl-9" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
            </div>
          </Field>
          {errors.form && <p className="text-xs text-destructive">{errors.form}</p>}
          <Button variant="gradient" className="w-full" type="submit" loading={loading}>
            Activate my dashboard
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <CreatePasswordInner />
    </Suspense>
  );
}
