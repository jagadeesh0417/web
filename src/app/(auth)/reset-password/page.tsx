"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { resetSchema, otpSchema } from "@/lib/validators";
import { verifyResetOtp, updatePassword, demoOtpFor, demoMode } from "@/lib/auth";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast("error", "Missing email", "Please restart the reset flow from the login page.");
      return;
    }
    const otpRes = otpSchema.safeParse(otp);
    if (!otpRes.success) {
      setErrors({ otp: otpRes.error.issues[0]?.message });
      return;
    }
    const pwRes = resetSchema.safeParse({ password, confirmPassword: confirm });
    if (!pwRes.success) {
      const errs: Record<string, string> = {};
      for (const i of pwRes.error.issues) if (!errs[String(i.path[0])]) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const verify = await verifyResetOtp(email, otp);
    if (!verify.ok) {
      setLoading(false);
      toast("error", "Invalid code", verify.error);
      return;
    }
    const update = await updatePassword(email, password);
    setLoading(false);
    if (!update.ok) {
      toast("error", "Update failed", update.error);
      return;
    }
    toast("success", "Password updated", "You can now log in with your new password.");
    router.push("/login");
  };

  return (
    <div>
      <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/10 text-brand-500">
        <KeyRound className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-2xl font-bold">Set a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {demoMode() && email && (
          <span className="text-warning">Demo OTP: {demoOtpFor(email) ?? "—"}</span>
        )}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="One-time code" error={errors.otp} htmlFor="otp" hint="6-digit code sent to your email">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="otp" className="pl-9 tracking-[0.3em] font-mono" placeholder="••••••" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} inputMode="numeric" />
          </div>
        </Field>
        <Field label="New password" error={errors.password} htmlFor="password">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" className="pl-9" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword} htmlFor="confirm">
          <Input id="confirm" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </Field>
        <Button type="submit" variant="gradient" className="w-full" loading={loading}>
          Update password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
