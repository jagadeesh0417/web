"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, UserRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { signupSchema } from "@/lib/validators";
import { signUp } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/rbac";
import type { Role } from "@/lib/types";

const roleOptions: Array<{ value: Role; label: string; hint: string }> = [
  { value: "intern", label: "Internship applicant", hint: "Apply for an internship program" },
  { value: "client", label: "Client", hint: "Track projects, invoices and support" },
  { value: "employee", label: "Employee", hint: "Akradhii team member workspace" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [role, setRole] = useState<Role>("intern");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = signupSchema.safeParse(form);
    if (!res.success) {
      const errs: Record<string, string> = {};
      for (const i of res.error.issues) if (!errs[String(i.path[0])]) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await signUp(form.name, form.email, form.password, role);
    setLoading(false);
    if (!result.ok) {
      toast("error", "Registration failed", result.error);
      return;
    }
    toast("success", "Account created", "Check your email to verify your account.");
    router.push(result.redirect ?? "/verify-email");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Join Akradhii — it takes less than a minute.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Full name" error={errors.name} htmlFor="name">
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="name" className="pl-9" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
          </div>
        </Field>
        <Field label="Email" error={errors.email} htmlFor="email">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" className="pl-9" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
          </div>
        </Field>
        <Field label="Password" error={errors.password} htmlFor="password" hint="Min 8 characters — uppercase, lowercase and a number.">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type={show ? "text" : "password"} className="pl-9 pr-10" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        <div>
          <p className="mb-2 text-sm font-medium">I want to join as</p>
          <div className="grid gap-2">
            {roleOptions.map((r) => (
              <label
                key={r.value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors ${role === r.value ? "border-brand-500 bg-brand-600/5" : "border-border hover:bg-muted/50"}`}
              >
                <input type="radio" name="role" className="h-4 w-4 accent-brand-600" checked={role === r.value} onChange={() => setRole(r.value)} />
                <div>
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.hint}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" variant="gradient" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-success" />
        Your data is encrypted and never shared. {ROLE_LABEL.admin} accounts are provisioned by the team only.
      </p>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-500 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
