"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  UploadCloud,
  Award,
  Mail,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Field } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES, PROGRAMS } from "@/lib/constants";
import { applicationSchema, validateFile } from "@/lib/validators";
import { demoCreatePendingAccount, demoMode } from "@/lib/auth";
import { createEnrollment } from "@/lib/data/repository";
import { emailTemplates, sendWorkflowEmail } from "@/lib/notifications";
import { submitLead } from "@/lib/leads/client";
import { cn, formatCurrency } from "@/lib/utils";

const steps = ["Program", "Details", "Payment", "Confirmation"];

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
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    category: params.get("category") ?? "",
    program: params.get("program") ?? "",
    duration: 6,
    fullName: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    college: "",
    course: "",
    branch: "",
    graduationYear: "",
    city: "",
    state: "",
    linkedin: "",
    github: "",
    resume: null as File | null,
    agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<(typeof PAY_METHODS)[number]["id"]>("upi");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ orderId: string; invoiceNumber: string; enrollmentId: string; studentId: string; token: string; amount: number; programTitle: string } | null>(null);

  const set = (key: keyof typeof form, value: string | number | boolean | File | null) => setForm((f) => ({ ...f, [key]: value }));

  const program = PROGRAMS.find((p) => p.slug === form.program);
  const category = CATEGORIES.find((c) => c.slug === form.category);
  const meta = DURATION_META[form.duration];
  const price = program ? Math.round(program.price * (form.duration / program.durationWeeks) * (form.duration === 8 ? 0.95 : 1)) : 0;

  useEffect(() => {
    if (form.program && !params.get("program")) return;
    if (params.get("duration")) {
      const d = Number(params.get("duration"));
      if ([4, 6, 8].includes(d)) set("duration", d);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateStep0 = () => {
    const errs: Record<string, string> = {};
    if (!form.category) errs.category = "Select an internship category";
    if (!form.program) errs.program = "Select a duration plan";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = () => {
    const res = applicationSchema.safeParse({
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      dob: form.dob,
      gender: form.gender,
      college: form.college,
      course: form.course,
      branch: form.branch,
      graduationYear: form.graduationYear,
      city: form.city,
      state: form.state,
      linkedin: form.linkedin,
      github: form.github,
      resume: form.resume,
      category: form.category,
      program: form.program,
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
    if (form.resume) {
      const v = validateFile(form.resume, "pdf");
      if (v) {
        setErrors({ resume: v });
        return false;
      }
    }
    setErrors({});
    return true;
  };

  const handlePayment = async () => {
    if (!program || !category || processing) return;
    setProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 2400));
      const created = createEnrollment({
        userId: `pending:${form.email}`,
        categorySlug: category.slug,
        programSlug: program.slug,
        programTitle: `${category.name} — ${program.title}`,
        durationWeeks: form.duration,
        price,
        clientName: form.fullName,
        email: form.email,
        method,
      });
      const token = demoCreatePendingAccount({
        email: form.email,
        name: form.fullName,
        mobile: form.mobile,
        enrollmentDbId: created.enrollment.id,
        studentId: created.enrollment.studentId,
        categorySlug: category.slug,
        programSlug: program.slug,
      });

      // Central lead pipeline → store + WhatsApp (+91 98485 79053)
      const leadResult = await submitLead({
        formType: "internship_application",
        source: `Internship Application — ${category.name}`,
        page: "Internship Application",
        pagePath: "/internships/apply",
        fields: {
          fullName: form.fullName,
          email: form.email,
          phone: form.mobile,
          mobile: form.mobile,
          dob: form.dob,
          gender: form.gender || undefined,
          college: form.college,
          course: form.course,
          branch: form.branch,
          graduationYear: form.graduationYear,
          city: form.city,
          state: form.state,
          linkedin: form.linkedin || undefined,
          github: form.github || undefined,
          category: category.name,
          program: program.title,
          internship: `${category.name} — ${program.title}`,
          duration: `${form.duration} weeks`,
          resume: form.resume ? form.resume.name : "Not uploaded",
          paymentMethod: method,
          amountPaid: price,
          orderId: created.payment.orderId,
          enrollmentId: created.enrollment.enrollmentId,
          studentId: created.enrollment.studentId,
          invoiceNumber: created.enrollment.invoiceNumber,
        },
      });
      if (!leadResult.ok) {
        console.warn("[apply] lead notify failed (enrollment kept):", leadResult.error);
      }

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
        subject: "Welcome to Akradhii",
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
        token,
        amount: price,
        programTitle: created.enrollment.programTitle,
      });
      setStep(3);
      toast("success", "Application Submitted Successfully", "Enrollment created. Check your email to activate your account.");
    } catch {
      toast("error", "Something went wrong. Please try again.", "");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <Badge variant="primary" className="mb-3">Internship application</Badge>
        <h1 className="text-3xl font-bold sm:text-4xl">Apply for your internship</h1>
        <p className="mt-2 text-sm text-muted-foreground">Pick your track, complete the form, pay securely — then create your password to begin.</p>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <div className="flex justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  i < step && "bg-success text-white",
                  i === step && "bg-gradient-to-r from-violet-600 to-indigo-600 text-white",
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
            <h2 className="text-lg font-semibold">1 · Choose your internship</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Category" error={errors.category}>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Plan" error={errors.program}>
                <select
                  value={form.program}
                  onChange={(e) => set("program", e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Select plan</option>
                  {PROGRAMS.map((p) => (
                    <option key={p.id} value={p.slug}>{p.title} — {p.durationWeeks} weeks</option>
                  ))}
                </select>
              </Field>
            </div>

            {program && (
              <div className="grid gap-3 sm:grid-cols-3">
                {[4, 6, 8].map((d) => {
                  const m = DURATION_META[d];
                  const p = Math.round(program.price * (d / program.durationWeeks) * (d === 8 ? 0.95 : 1));
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
                      <p className="mt-1 text-lg font-extrabold">{formatCurrency(p)}</p>
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
            )}

            {program && meta && (
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
              <Field label="Date of birth" error={errors.dob}>
                <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
              </Field>
              <Field label="Gender (optional)">
                <select
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">Prefer not to say</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="College / University" error={errors.college}>
                <Input value={form.college} onChange={(e) => set("college", e.target.value)} placeholder="College name" />
              </Field>
              <Field label="Degree / Course" error={errors.course}>
                <Input value={form.course} onChange={(e) => set("course", e.target.value)} placeholder="B.Tech CSE, MBA…" />
              </Field>
              <Field label="Branch" error={errors.branch}>
                <Input value={form.branch} onChange={(e) => set("branch", e.target.value)} placeholder="Computer Science" />
              </Field>
              <Field label="Graduation year" error={errors.graduationYear}>
                <Input value={form.graduationYear} onChange={(e) => set("graduationYear", e.target.value)} placeholder="2027" />
              </Field>
              <Field label="City" error={errors.city}>
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Hyderabad" />
              </Field>
              <Field label="State" error={errors.state}>
                <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Telangana" />
              </Field>
              <Field label="LinkedIn (optional)" error={errors.linkedin}>
                <Input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/you" />
              </Field>
              <Field label="GitHub (optional)" error={errors.github}>
                <Input value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="github.com/you" />
              </Field>
            </div>

            <FileDrop
              label="Resume (PDF) *"
              accept=".pdf"
              file={form.resume}
              error={errors.resume}
              onSelect={(f) => set("resume", f)}
            />

            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-muted/30 p-3.5 text-sm">
              <input
                type="checkbox"
                checked={form.agree}
                onChange={(e) => set("agree", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-violet-600"
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
                Secured by 256-bit TLS. In production, payments are processed by Razorpay (UPI, cards, net banking, wallets) with webhook-driven confirmation — this demo simulates the same flow end-to-end.
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
                Welcome to <strong className="text-foreground">{result.programTitle}</strong>. Your enrollment is confirmed — here are your details.
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

              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <p className="font-semibold">Next step: create your password</p>
                <p className="mt-1 text-muted-foreground">
                  We sent you a <strong>verification link</strong> to <span className="font-medium text-foreground">{form.email}</span>.
                  Click it to open the <strong>Create Password</strong> page and activate your dashboard.
                </p>
                {demoMode() && (
                  <div className="mt-3 rounded-lg border border-dashed border-brand-500/40 bg-background p-3">
                    <p className="text-xs text-muted-foreground">Demo mode — no real email is sent. Open your verification link:</p>
                    <Link
                      href={`/create-password?token=${result.token}`}
                      className="mt-1 block truncate font-mono text-xs text-brand-500 underline"
                    >
                      /create-password?token={result.token}
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 pt-2">
                <Link href="/login">
                  <Button variant="outline">Go to login</Button>
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

function FileDrop({ label, accept, file, error, onSelect }: { label: string; accept: string; file: File | null; error?: string; onSelect: (f: File | null) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-brand-500/60">
        {file ? (
          <>
            <CheckCircle2 className="h-8 w-8 text-success" />
            <span className="text-sm font-medium">{file.name}</span>
            <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB — click to replace</span>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Click to upload</span>
            <span className="text-xs text-muted-foreground">{accept} · max 10 MB</span>
          </>
        )}
        <input type="file" accept={accept} className="hidden" onChange={(e) => onSelect(e.target.files?.[0] ?? null)} />
      </label>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
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
