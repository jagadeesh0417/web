"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Lock,
  Package,
  PartyPopper,
  Smartphone,
  CreditCard,
  Landmark,
  Wallet,
  Award,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Field } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES, PROGRAMS } from "@/lib/constants";
import { applicationSchema } from "@/lib/validators";
import { createInternAccount, signIn } from "@/lib/auth";
import { createEnrollment } from "@/lib/data/repository";
import { emailTemplates, sendWorkflowEmail } from "@/lib/notifications";
import { cn, formatCurrency } from "@/lib/utils";

const steps = ["Course", "Details", "Payment", "Confirmation"];

const DURATION_META: Record<number, { modules: number; projects: number; completion: string; curriculum: string[] }> = {
  4: {
    modules: 4,
    projects: 2,
    completion: "4 weeks",
    curriculum: ["2 recorded video lessons per week", "4 weekly PDF note packs", "2 project builds", "1 final assessment"],
  },
  6: {
    modules: 6,
    projects: 3,
    completion: "6 weeks",
    curriculum: ["2-3 recorded video lessons per week", "6 weekly PDF note packs", "3 project builds", "1 final assessment + 1 capstone"],
  },
  8: {
    modules: 8,
    projects: 4,
    completion: "8 weeks",
    curriculum: ["3 recorded video lessons per week", "8 weekly PDF note packs", "4 project builds", "1 capstone + portfolio review"],
  },
};

const PAY_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Landmark },
  { id: "wallet", label: "Wallet", icon: Wallet },
] as const;

function Wizard() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    category: params.get("category") ?? "",
    duration: 6,
    fullName: "",
    email: "",
    mobile: "",
    dob: "",
    state: "",
    college: "",
    agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<(typeof PAY_METHODS)[number]["id"]>("upi");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ orderId: string; invoiceNumber: string; enrollmentId: string; studentId: string; amount: number; programTitle: string } | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const set = (key: keyof typeof form, value: string | number | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const program = PROGRAMS.find((p) => p.durationWeeks === form.duration);
  const category = CATEGORIES.find((c) => c.slug === form.category);
  const meta = DURATION_META[form.duration];
  const price = program?.price ?? 0;

  const validateStep0 = () => {
    const errs: Record<string, string> = {};
    if (!form.category) errs.category = "Select a course category";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = () => {
    const res = applicationSchema.safeParse({
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      dob: form.dob,
      gender: "",
      college: form.college,
      course: category?.name ?? "",
      branch: "",
      graduationYear: "",
      city: "",
      state: form.state,
      linkedin: "",
      github: "",
      resume: null,
      category: form.category,
      program: program?.slug ?? "",
      duration: form.duration,
      agree: form.agree,
    });
    if (!res.success) {
      const errs: Record<string, string> = {};
      for (const issue of res.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  };

  const handlePayment = async () => {
    if (!program || !category) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2400));

    const accountRes = await createInternAccount(form.fullName, form.email, form.dob, {
      fullName: form.fullName,
      mobile: form.mobile,
      email: form.email,
      college: form.college,
      state: form.state,
      dob: form.dob,
      course: category.name,
    });
    if (!accountRes.ok) {
      setProcessing(false);
      toast("error", "Account creation failed", accountRes.error);
      return;
    }
    const userId = accountRes.user?.id ?? `pending:${form.email}`;

    const created = createEnrollment({
      userId,
      categorySlug: category.slug,
      programSlug: program.slug,
      programTitle: `${category.name} — ${program.title}`,
      durationWeeks: form.duration,
      price,
      clientName: form.fullName,
      email: form.email,
      method,
    });
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const t = emailTemplates();
    const start = created.enrollment.startedAt.slice(0, 10);
    const end = new Date(new Date(start).getTime() + form.duration * 7 * 86400000).toISOString().slice(0, 10);
    await sendWorkflowEmail({
      to: form.email,
      subject: "Payment successful — " + created.enrollment.programTitle,
      template: "payment_confirmation",
      html: t.paymentConfirmation(form.fullName, {
        programTitle: created.enrollment.programTitle,
        amount: price,
        orderId: created.payment.orderId,
        invoiceNumber: created.enrollment.invoiceNumber,
        enrollmentId: created.enrollment.enrollmentId,
        studentId: created.enrollment.studentId,
      }),
    });
    await sendWorkflowEmail({
      to: form.email,
      subject: "Your internship offer letter",
      template: "offer_letter",
      html: t.offerLetter(form.fullName, {
        programTitle: created.enrollment.programTitle,
        durationWeeks: form.duration,
        startDate: start,
        endDate: end,
        studentId: created.enrollment.studentId,
      }),
    });
    await sendWorkflowEmail({
      to: form.email,
      subject: "Welcome to Akradhii — login with your date of birth",
      template: "welcome",
      html: t.welcome(form.fullName, {
        programTitle: created.enrollment.programTitle,
        dashboardUrl: `${origin}/login`,
      }),
    });
    setResult({
      orderId: created.payment.orderId,
      invoiceNumber: created.enrollment.invoiceNumber,
      enrollmentId: created.enrollment.enrollmentId,
      studentId: created.enrollment.studentId,
      amount: price,
      programTitle: created.enrollment.programTitle,
    });
    setLoginForm({ email: form.email, password: "" });
    setProcessing(false);
    setStep(3);
    toast("success", "Payment successful!", "Your account is ready. Login with your email and date of birth.");
  };

  const handleLogin = async () => {
    setLoginError("");
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setLoginError("Enter your email and date of birth.");
      return;
    }
    setLoggingIn(true);
    const res = await signIn(loginForm.email.trim(), loginForm.password, true);
    setLoggingIn(false);
    if (!res.ok) {
      setLoginError("Incorrect email or date of birth. Please try again.");
      return;
    }
    toast("success", "Welcome back!", `Signed in as ${res.user?.name ?? loginForm.email}`);
    router.push("/student");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <Badge variant="primary" className="mb-3">Internship application</Badge>
        <h1 className="text-3xl font-bold sm:text-4xl">Apply for your internship</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pick your course, share a few details, pay securely — then log in with your date of birth to begin.</p>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <div className="flex justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  i < step && "bg-success text-white",
                  i === step && "bg-gradient-to-r from-amber-600 to-orange-600 text-white",
                  i > step && "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("hidden text-[10px] font-medium sm:block", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
            </div>
          ))}
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="mt-4" />
      </div>

      <Card className="mt-8 p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">1 · Choose your course</h2>
            <Field label="Course" error={errors.category}>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Select a course</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </Field>

            <div>
              <p className="mb-2 text-sm font-medium">Duration</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {[4, 6, 8].map((d) => {
                  const m = DURATION_META[d];
                  const p = PROGRAMS.find((pr) => pr.durationWeeks === d);
                  const selected = form.duration === d;
                  return (
                    <button
                      key={d}
                      onClick={() => set("duration", d)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        selected ? "border-brand-500 bg-brand-600/5 ring-2 ring-brand-500/30" : "border-border hover:border-brand-500/40",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{d} Weeks</span>
                        {selected && <CheckCircle2 className="h-4 w-4 text-brand-500" />}
                      </div>
                      {p && <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{p.title}</p>}
                      <p className="mt-1 text-lg font-extrabold">{formatCurrency(p?.price ?? 0)}</p>
                      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                        <li className="flex items-center gap-1.5"><LayoutGrid className="h-3 w-3" /> {m.modules} course modules</li>
                        <li className="flex items-center gap-1.5"><Package className="h-3 w-3" /> {m.projects} projects</li>
                        <li className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {m.completion}</li>
                        <li className="flex items-center gap-1.5"><Award className="h-3 w-3" /> Verified certificate</li>
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>

            {meta && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <p className="font-semibold">{form.duration}-week curriculum</p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {meta.curriculum.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => validateStep0() && setStep(1)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">2 · Your details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName}>
                <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="As per your ID" />
              </Field>
              <Field label="Email address" error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
              </Field>
              <Field label="Mobile number" error={errors.mobile}>
                <Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+91 98765 43210" />
              </Field>
              <Field label="State" error={errors.state}>
                <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Telangana" />
              </Field>
              <Field label="College / University" error={errors.college}>
                <Input value={form.college} onChange={(e) => set("college", e.target.value)} placeholder="College name" />
              </Field>
              <Field label="Date of birth" error={errors.dob} hint="Used as your login password">
                <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
              </Field>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-muted/30 p-3.5 text-sm">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => set("agree", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-amber-600"
              />
              <span className="text-muted-foreground">
                I agree to the <Link href="/terms" className="text-brand-500 underline">Terms &amp; Conditions</Link> and{" "}
                <Link href="/privacy" className="text-brand-500 underline">Privacy Policy</Link>. I confirm the details above are accurate.
              </span>
            </label>
            {errors.agree && <p className="text-xs text-destructive">{errors.agree}</p>}

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Back</Button>
              <Button onClick={() => validateStep1() && setStep(2)}>Continue to payment <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-3">
              <h2 className="text-lg font-semibold">3 · Payment</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PAY_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all",
                      method === m.id ? "border-brand-500 bg-brand-600/5 ring-2 ring-brand-500/30" : "border-border text-muted-foreground hover:border-brand-500/40",
                    )}
                  >
                    <m.icon className="h-5 w-5" />
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                {method === "upi" && (
                  <Field label="UPI ID" hint="Demo mode: any UPI ID works.">
                    <Input placeholder="yourname@okhdfcbank" />
                  </Field>
                )}
                {method === "card" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Card number" hint="Demo mode: any 16-digit card works.">
                        <Input placeholder="4111 1111 1111 1111" />
                      </Field>
                    </div>
                    <Field label="Expiry"><Input placeholder="MM / YY" /></Field>
                    <Field label="CVV"><Input type="password" placeholder="•••" maxLength={4} /></Field>
                  </div>
                )}
                {method === "netbanking" && (
                  <Field label="Bank" hint="Demo mode: any bank works.">
                    <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                    </select>
                  </Field>
                )}
                {method === "wallet" && (
                  <Field label="Wallet" hint="Demo mode: any wallet works.">
                    <select className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30">
                      <option>Paytm</option>
                      <option>PhonePe</option>
                      <option>Google Pay</option>
                      <option>Amazon Pay</option>
                    </select>
                  </Field>
                )}
              </div>

              <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                Secured by 256-bit TLS. Payments are processed by Razorpay (UPI, cards, net banking, wallets) with webhook-driven confirmation — this demo simulates the same flow end-to-end.
              </p>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border bg-muted/20 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Order summary</p>
                <p className="mt-2 text-lg font-bold">{form.fullName || "Your name"}</p>
                <p className="text-sm text-muted-foreground">{category?.name ?? "Internship"} — {form.duration} weeks</p>
                <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Program fee</span><span>{formatCurrency(price)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Taxes</span><span className="text-success">Included</span></div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>{formatCurrency(price)}</span></div>
                </div>
                <Button variant="gradient" className="mt-5 w-full" onClick={handlePayment} loading={processing}>
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing payment…
                    </>
                  ) : (
                    <>Pay {formatCurrency(price)} securely</>
                  )}
                </Button>
                <div className="mt-3 flex justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <span className="self-center text-xs text-muted-foreground">Powered by Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && result && (
          <div className="py-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                <PartyPopper className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-2xl font-bold">Payment successful!</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Welcome to <strong className="text-foreground">{result.programTitle}</strong>. Your account is ready — here are your details.
              </p>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-success/30 bg-success/5 p-5 text-sm sm:grid-cols-2">
              {[
                ["Invoice number", result.invoiceNumber],
                ["Enrollment ID", result.enrollmentId],
                ["Student ID", result.studentId],
                ["Order ID", result.orderId],
                ["Amount paid", formatCurrency(result.amount)],
                ["Status", "Payment Successful"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="font-mono text-xs font-bold">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-brand-500/30 bg-brand-600/5 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4 text-brand-500" /> 3 emails are on their way</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• Payment confirmation with invoice</li>
                  <li>• Internship offer letter (PDF)</li>
                  <li>• Welcome email with course details</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-brand-500/40 bg-gradient-to-b from-brand-600/5 to-transparent p-5">
                <p className="flex items-center gap-2 text-base font-bold">
                  <LogIn className="h-4 w-4 text-brand-500" /> Login to your course
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your username is your <strong className="text-foreground">email</strong> and your password is your{" "}
                  <strong className="text-foreground">date of birth</strong> (e.g. 2004-05-14). No email verification needed.
                </p>
                <div className="mt-4 space-y-3">
                  <Field label="Email (username)">
                    <Input type="email" value={loginForm.email} onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
                  </Field>
                  <Field label="Password (date of birth)">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder="2004-05-14"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  {loginError && <p className="text-xs font-medium text-destructive">{loginError}</p>}
                  <Button variant="gradient" className="w-full" onClick={handleLogin} loading={loggingIn}>
                    {loggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : <><LogIn className="h-4 w-4" /> Login to your course</>}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 pt-2">
                <Link href="/login">
                  <Button variant="outline">Go to login page</Button>
                </Link>
                <Link href="/internships" className="text-xs text-muted-foreground hover:text-foreground">Back to internships</Link>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center">Loading…</div>}>
      <Wizard />
    </Suspense>
  );
}
