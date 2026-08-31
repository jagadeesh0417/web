"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { loginSchema } from "@/lib/validators";
import { signIn, getSession, demoMode } from "@/lib/auth";

function AdminLoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { user } = await getSession();
      if (user && (user.role === "admin" || user.role === "super_admin")) {
        router.replace("/admin");
      }
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginSchema.safeParse(form);
    if (!res.success) {
      const errs: Record<string, string> = {};
      for (const i of res.error.issues)
        if (!errs[String(i.path[0])]) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    const result = await signIn(form.email, form.password, true);
    setLoading(false);
    if (!result.ok) {
      toast("error", "Login failed", result.error);
      return;
    }
    if (result.user && (result.user.role === "admin" || result.user.role === "super_admin")) {
      toast("success", "Welcome back, Admin!");
      router.push("/admin");
      router.refresh();
    } else {
      toast("error", "Access denied", "You do not have admin privileges.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="mt-1 text-sm text-zinc-400">Sign in with your admin credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email" error={errors.email} htmlFor="admin-email">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="admin-email"
                  type="email"
                  className="pl-9 border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:ring-violet-500/20"
                  placeholder="admin@akradhii.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
            </Field>

            <Field label="Password" error={errors.password} htmlFor="admin-password">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="admin-password"
                  type={show ? "text" : "password"}
                  className="pl-9 pr-10 border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus:border-violet-500 focus:ring-violet-500/20"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  aria-label="Toggle password"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25"
              loading={loading}
            >
              Sign in as Admin
            </Button>
          </form>

          {demoMode() && (
            <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div className="text-xs text-zinc-400">
                  <p className="font-semibold text-amber-500">Demo mode</p>
                  <p className="mt-1">
                    Use: <code className="rounded bg-white/10 px-1 text-amber-400">admin@akradhii.com</code> ·
                    Password: <code className="rounded bg-white/10 px-1 text-amber-400">Akradhii@123</code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Akradhii · Authorized personnel only
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
