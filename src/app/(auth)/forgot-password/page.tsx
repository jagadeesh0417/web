"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { forgotSchema } from "@/lib/validators";
import { requestPasswordReset, demoOtpFor, demoMode } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = forgotSchema.safeParse({ email });
    if (!res.success) {
      setError(res.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (!result.ok) {
      toast("error", "Request failed", result.error);
      return;
    }
    if (demoMode()) {
      toast("success", "OTP sent", `Demo OTP: ${demoOtpFor(email) ?? "check console"}`);
    } else {
      toast("success", "Reset link sent", "Check your inbox for the reset link.");
    }
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <div>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/10 text-brand-500">
        <KeyRound className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-2xl font-bold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your account email and we&apos;ll send you a one-time code to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Email" error={error} htmlFor="email">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" className="pl-9" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
        </Field>
        <Button type="submit" variant="gradient" className="w-full" loading={loading}>
          Send reset code
        </Button>
      </form>
    </div>
  );
}
