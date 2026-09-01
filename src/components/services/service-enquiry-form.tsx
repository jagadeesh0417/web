"use client";

import { useState, useRef } from "react";
import { CheckCircle2, Send, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { submitLead } from "@/lib/leads/client";
import { emailSchema, nameSchema, phoneSchema } from "@/lib/validators";

function validateField(name: string, value: string): string | undefined {
  switch (name) {
    case "name":
      if (!value.trim()) return "Full name is required.";
      if (!nameSchema.safeParse(value).success) return "Name must be at least 2 characters.";
      return undefined;
    case "email":
      if (!value.trim()) return "Email is required.";
      if (!emailSchema.safeParse(value).success) return "Please enter a valid email address.";
      return undefined;
    case "phone":
      if (!value.trim()) return "Phone number is required.";
      if (!phoneSchema.safeParse(value).success) return "Please enter a valid 10-digit Indian phone number.";
      return undefined;
    case "message":
      if (!value.trim()) return "Project details are required.";
      if (value.trim().length < 20) return "Please provide at least 20 characters.";
      return undefined;
    default:
      return undefined;
  }
}

export function ServiceEnquiryForm({
  serviceTitle,
  serviceSlug,
}: {
  serviceTitle: string;
  serviceSlug: string;
}) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => {
      if (error) return { ...prev, [name]: error };
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setServerError(null);

    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const budget = String(data.get("budget") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Record<string, string> = {};
    const nameErr = validateField("name", name);
    const emailErr = validateField("email", email);
    const phoneErr = validateField("phone", phone);
    const messageErr = validateField("message", message);
    if (nameErr) next.name = nameErr;
    if (emailErr) next.email = emailErr;
    if (phoneErr) next.phone = phoneErr;
    if (messageErr) next.message = messageErr;
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    const result = await submitLead({
      formType: "service_enquiry",
      source: `Service Enquiry — ${serviceTitle}`,
      page: serviceTitle,
      pagePath: `/services/${serviceSlug}`,
      website: honeypot,
      fields: { name, email, phone, company, service: serviceTitle, budget, message },
    });
    setSubmitting(false);

    if (!result.ok) {
      setServerError("Submission failed.");
      return;
    }

    setSent(true);
    formRef.current?.reset();
    toast("success", "Message Sent Successfully", "We'll get back to you within 24 hours.");
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center py-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="h-9 w-9 text-success" />
        </div>
        <h3 className="mt-4 text-xl font-bold">Message sent!</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Thanks for your interest in {serviceTitle}. Our team will respond within 24 hours.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative space-y-4" noValidate>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor={`hp-${serviceSlug}`}>Website</label>
        <input id={`hp-${serviceSlug}`} name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      {serverError && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">Something went wrong.</p>
            <p className="mt-1 text-muted-foreground">Please try WhatsApp or email <a href="mailto:hello@akradhii.com" className="font-medium text-brand-400 hover:underline">hello@akradhii.com</a>.</p>
          </div>
          <button type="button" onClick={() => setServerError(null)} className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Field label="Service">
        <Input name="service" value={serviceTitle} readOnly className="bg-muted/40" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor={`name-${serviceSlug}`} error={errors.name}>
          <Input id={`name-${serviceSlug}`} name="name" required autoComplete="name" placeholder="Your name" onBlur={handleBlur} />
        </Field>
        <Field label="Phone" htmlFor={`phone-${serviceSlug}`} error={errors.phone}>
          <Input id={`phone-${serviceSlug}`} name="phone" type="tel" required autoComplete="tel" placeholder="+91 98485 79053" onBlur={handleBlur} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor={`email-${serviceSlug}`} error={errors.email}>
          <Input id={`email-${serviceSlug}`} name="email" type="email" required autoComplete="email" placeholder="you@company.com" onBlur={handleBlur} />
        </Field>
        <Field label="Company (optional)" htmlFor={`company-${serviceSlug}`}>
          <Input id={`company-${serviceSlug}`} name="company" autoComplete="organization" placeholder="Business name" />
        </Field>
      </div>

      <Field label="Budget range" htmlFor={`budget-${serviceSlug}`}>
        <select id={`budget-${serviceSlug}`} name="budget" className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" defaultValue="Not sure yet">
          <option>Under ₹50,000</option>
          <option>₹50,000 – ₹2,00,000</option>
          <option>₹2,00,000 – ₹10,00,000</option>
          <option>₹10,00,000+</option>
          <option>Not sure yet</option>
        </select>
      </Field>

      <Field label="Project / requirement" htmlFor={`message-${serviceSlug}`} error={errors.message}>
        <Textarea id={`message-${serviceSlug}`} name="message" required placeholder="Goals, timeline, current setup…" className="min-h-[120px]" onBlur={handleBlur} />
      </Field>

      <Button type="submit" variant="gradient" size="lg" loading={submitting} disabled={submitting} className="w-full sm:w-auto">
        <Send className="h-4 w-4" /> {submitting ? "Sending..." : "Request a quote"}
      </Button>
    </form>
  );
}
