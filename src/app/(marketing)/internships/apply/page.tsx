"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  UploadCloud,
  Loader2,
  Mail,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Field } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES, PROGRAMS } from "@/lib/constants";
import { applicationSchema, validateFile } from "@/lib/validators";
import { cn, formatCurrency } from "@/lib/utils";

const steps = ["Program", "Details", "Review", "Payment", "Confirmation"];

function Wizard() {
  const params = useSearchParams();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    category: CATEGORIES.find((c) => c.slug === (params.get("track") ?? params.get("category")))?.slug ?? "",
    program: PROGRAMS.find((p) => p.slug === params.get("program"))?.slug ?? "",
    duration: Number.parseInt(PROGRAMS.find((p) => p.slug === params.get("program"))?.duration ?? "6", 10),
    fullName: "",
    email: "",
    confirmEmail: "",
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
  const [referralCode, setReferralCode] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"idle" | "processing" | "verifying" | "done" | "failed">("idle");
  const [applicationId, setApplicationId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [enrollmentResult] = useState<{
    enrollmentId: string;
    studentId: string;
    invoiceNumber: string;
  } | null>(null);

  const set = (key: keyof typeof form, value: string | number | boolean | File | null) => setForm((f) => ({ ...f, [key]: value }));

  const program = PROGRAMS.find((p) => p.slug === form.program);
  const category = CATEGORIES.find((c) => c.slug === form.category);

  useEffect(() => {
    // Read referral code from cookie
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const refCookie = cookies.find((c) => c.startsWith("ak_ref="));
    if (refCookie) {
      setReferralCode(refCookie.split("=")[1] ?? "");
    }
  }, []);

  const validateStep0 = () => {
    const errs: Record<string, string> = {};
    if (!category) errs.category = "Select an internship category";
    if (!program) errs.program = "Select a duration plan";
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
    const errs: Record<string, string> = {};
    if (!res.success) {
      for (const issue of res.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errs[key]) errs[key] = issue.message;
      }
    }
    if (form.email && form.confirmEmail && form.email.toLowerCase() !== form.confirmEmail.toLowerCase()) {
      errs.confirmEmail = "Email addresses do not match.";
    }
    if (!form.confirmEmail) {
      errs.confirmEmail = "Please confirm your email address.";
    }
    if (form.resume) {
      const v = validateFile(form.resume, "pdf");
      if (v) errs.resume = v;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!program || !category || processing) return;
    setProcessing(true);
    setErrors({});

    try {
      const res = await fetch("/api/internships/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          program: form.program,
          duration: form.duration,
          fullName: form.fullName,
          email: form.email,
          confirmEmail: form.confirmEmail,
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
          agree: form.agree,
          website,
          referralCode: referralCode || undefined,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        setErrors({ ...data.errors, general: data.error ?? "Failed to submit application. Please check your details or contact support." });
        setProcessing(false);
        return;
      }

      setApplicationId(data.applicationId);
      setOrderId(data.orderId);
      setStep(3);
    } catch {
      setErrors({ general: "Network error. Please check your connection and try again." });
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = useCallback(async () => {
    if (!applicationId || paymentStep !== "idle") return;
    setPaymentStep("processing");

    try {
      const createRes = await fetch("/api/internships/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      const createData = await createRes.json();

      if (!createData.ok) {
        setPaymentStep("failed");
        toast("error", "Payment failed", createData.error ?? "Could not initiate payment.");
        return;
      }

      // Never confirm an order without an authenticated provider payment response.
      setPaymentStep("failed");
      toast("error", "Checkout unavailable", "Payment confirmation is not configured. Please contact support.");
    } catch {
      setPaymentStep("failed");
      toast("error", "Something went wrong", "Please try again or contact support.");
    }
  }, [applicationId, paymentStep, toast]);

  const retryPayment = () => {
    setPaymentStep("idle");
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
        <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label htmlFor="application-website">Leave this field empty</label>
          <input id="application-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">1 · Choose your internship</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Category" error={errors.category}>
                <CustomSelect
                  options={CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))}
                  value={form.category}
                  onChange={(v) => set("category", v)}
                  placeholder="Select category"
                />
              </Field>
              <Field label="Plan" error={errors.program}>
                <CustomSelect
                  options={PROGRAMS.map((p) => ({ value: p.slug, label: `${p.title} — ${p.duration}` }))}
                  value={form.program}
                  onChange={(v) => {
                    const selected = PROGRAMS.find((p) => p.slug === v);
                    setForm((current) => ({ ...current, program: v, duration: selected ? Number.parseInt(selected.duration, 10) : 6 }));
                  }}
                  placeholder="Select plan"
                />
              </Field>
            </div>

            {program && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                <p className="font-semibold">{program.title} · {program.duration} · {formatCurrency(program.price)}</p>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {program.features.map((c) => (
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
            {errors.general && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {errors.general}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
                <Input id="fullName" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="As per your ID" autoComplete="name" />
              </Field>
              <Field label="Email address" htmlFor="email" error={errors.email}>
                <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </Field>
              <Field label="Confirm email address" htmlFor="confirmEmail" error={errors.confirmEmail}>
                <Input id="confirmEmail" type="email" value={form.confirmEmail} onChange={(e) => set("confirmEmail", e.target.value)} placeholder="Re-enter your email" autoComplete="email" />
              </Field>
              <Field label="Mobile number" htmlFor="mobile" error={errors.mobile}>
                <Input id="mobile" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+91 98485 79053" autoComplete="tel" />
              </Field>
              <Field label="Date of birth" htmlFor="dob" error={errors.dob}>
                <Input id="dob" type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
              </Field>
              <Field label="Gender (optional)" htmlFor="gender">
                <CustomSelect
                  id="gender"
                  options={[
                    { value: "", label: "Prefer not to say" },
                    { value: "Female", label: "Female" },
                    { value: "Male", label: "Male" },
                    { value: "Other", label: "Other" },
                  ]}
                  value={form.gender}
                  onChange={(v) => set("gender", v)}
                  placeholder="Prefer not to say"
                />
              </Field>
              <Field label="College / University" htmlFor="college" error={errors.college}>
                <Input id="college" value={form.college} onChange={(e) => set("college", e.target.value)} placeholder="College name" autoComplete="organization" />
              </Field>
              <Field label="Degree / Course" htmlFor="course" error={errors.course}>
                <Input id="course" value={form.course} onChange={(e) => set("course", e.target.value)} placeholder="B.Tech CSE, MBA…" />
              </Field>
              <Field label="Branch" htmlFor="branch" error={errors.branch}>
                <Input id="branch" value={form.branch} onChange={(e) => set("branch", e.target.value)} placeholder="Computer Science" />
              </Field>
              <Field label="Graduation year" htmlFor="graduationYear" error={errors.graduationYear}>
                <Input id="graduationYear" value={form.graduationYear} onChange={(e) => set("graduationYear", e.target.value)} placeholder="2027" />
              </Field>
              <Field label="City" htmlFor="city" error={errors.city}>
                <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Hyderabad" />
              </Field>
              <Field label="State" htmlFor="state" error={errors.state}>
                <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Telangana" />
              </Field>
              <Field label="LinkedIn (optional)" htmlFor="linkedin" error={errors.linkedin}>
                <Input id="linkedin" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/you" />
              </Field>
              <Field label="GitHub (optional)" htmlFor="github" error={errors.github}>
                <Input id="github" value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="github.com/you" />
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
              <Button onClick={() => validateStep1() && setStep(2)}>Review application <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {step === 2 && program && category && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">3 · Review your application</h2>
            {errors.general && <p role="alert" className="rounded-xl border border-destructive/40 p-3 text-sm text-destructive">{errors.general}</p>}

            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Selected Internship</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Program</p>
                  <p className="font-semibold">{category.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-semibold">{program.title} — {form.duration} weeks</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Student Details</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  ["Full name", form.fullName],
                  ["Email", form.email],
                  ["Mobile", form.mobile],
                  ["College", form.college],
                  ["Course", form.course],
                  ["Branch", form.branch || "—"],
                  ["Graduation year", form.graduationYear || "—"],
                  ["City", form.city || "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-brand-500/30 bg-brand-600/5 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment Summary</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Program fee</span><span>{formatCurrency(program.price)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Taxes</span><span className="text-success">Included</span></div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Total</span><span>{formatCurrency(program.price)}</span></div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
              <Button variant="gradient" onClick={handleProceedToPayment} loading={processing} disabled={processing}>
                {processing ? "Submitting..." : "Proceed to payment"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && program && category && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">4 · Payment</h2>

            <div className="rounded-2xl border border-border bg-muted/20 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Program</p>
                  <p className="font-semibold">{category.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="font-semibold">{program.title} — {form.duration} weeks</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Student</p>
                  <p className="font-semibold">{form.fullName}</p>
                  <p className="text-xs text-muted-foreground">{form.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-2xl font-extrabold">{formatCurrency(program.price)}</p>
                </div>
              </div>
            </div>

            {paymentStep === "idle" && (
              <>
                <p className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  Online checkout is currently unavailable. Your application does not activate an enrollment or collect a payment.
                </p>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button variant="gradient" onClick={handlePayment}>
                    Pay {formatCurrency(program.price)} securely
                  </Button>
                </div>
              </>
            )}

            {paymentStep === "processing" && (
              <div className="flex flex-col items-center py-8 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
                <p className="mt-4 text-lg font-semibold">Processing payment…</p>
                <p className="mt-1 text-sm text-muted-foreground">Please do not close this page.</p>
              </div>
            )}

            {paymentStep === "verifying" && (
              <div className="flex flex-col items-center py-8 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
                <p className="mt-4 text-lg font-semibold">Verifying payment…</p>
                <p className="mt-1 text-sm text-muted-foreground">Confirming your transaction with the server.</p>
              </div>
            )}

            {paymentStep === "failed" && (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <p className="mt-4 text-lg font-semibold">Payment unsuccessful</p>
                <p className="mt-1 text-sm text-muted-foreground">Something went wrong with the payment. Please try again.</p>
                <div className="mt-6 flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button variant="gradient" onClick={retryPayment}>Try again</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && enrollmentResult && (
          <div className="py-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-2xl font-bold">Enrollment Successful!</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Your payment has been confirmed and your internship enrollment has been created.
              </p>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl border border-success/30 bg-success/5 p-5 text-sm sm:grid-cols-2">
              {[
                ["Application ID", applicationId],
                ["Enrollment ID", enrollmentResult.enrollmentId],
                ["Invoice Number", enrollmentResult.invoiceNumber],
                ["Order ID", orderId],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2 rounded-lg bg-card px-3 py-2">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="font-mono text-xs font-bold">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-brand-500/30 bg-brand-600/5 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4 text-brand-500" /> Your login information will be shared to your registered email address.</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• Payment confirmation with invoice</li>
                  <li>• Internship offer letter</li>
                  <li>• Welcome email with login details</li>
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">Please check your inbox and spam/junk folder.</p>
              </div>

              <div className="flex flex-col items-center gap-2 pt-2">
                <Link href="/login">
                  <Button variant="outline">Go to Login</Button>
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
