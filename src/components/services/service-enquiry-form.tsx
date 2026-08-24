"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { submitLead } from "@/lib/leads/client";
import { emailSchema, nameSchema, phoneSchema } from "@/lib/validators";

export function ServiceEnquiryForm({
  serviceTitle,
  serviceSlug,
}: {
  serviceTitle: string;
  serviceSlug: string;
}) {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const company = String(data.get("company") ?? "").trim();
    const budget = String(data.get("budget") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Record<string, string> = {};
    if (!nameSchema.safeParse(name).success) next.name = "Enter your full name";
    if (!emailSchema.safeParse(email).success) next.email = "Please enter a valid email address.";
    if (!phone || !phoneSchema.safeParse(phone).success) next.phone = "Please enter a valid phone number.";
    if (!message || message.length < 5) next.message = "Tell us a bit about your requirement.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    const result = await submitLead({
      formType: "service_enquiry",
      source: `Service Enquiry — ${serviceTitle}`,
      page: serviceTitle,
      pagePath: `/services/${serviceSlug}`,
      website: honeypot,
      fields: {
        name,
        email,
        phone,
        company,
        service: serviceTitle,
        budget,
        message,
      },
    });
    setSubmitting(false);

    if (!result.ok) {
      toast("error", "Something went wrong. Please try again.", "");
      return;
    }

    setSent(true);
    formEl.reset();
    toast("success", "Message Sent Successfully", "We'll get back to you within 24 hours.");
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-success" />
        <h3 className="mt-4 text-xl font-bold">Message Sent Successfully</h3>
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
    <form onSubmit={handleSubmit} className="relative space-y-4" noValidate>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor={`hp-${serviceSlug}`}>Website</label>
        <input
          id={`hp-${serviceSlug}`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <Field label="Service">
        <Input name="service" value={serviceTitle} readOnly className="bg-muted/40" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor={`name-${serviceSlug}`} error={errors.name}>
          <Input id={`name-${serviceSlug}`} name="name" required autoComplete="name" placeholder="Your name" />
        </Field>
        <Field label="Phone" htmlFor={`phone-${serviceSlug}`} error={errors.phone}>
          <Input id={`phone-${serviceSlug}`} name="phone" type="tel" required autoComplete="tel" placeholder="+91 98765 43210" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" htmlFor={`email-${serviceSlug}`} error={errors.email}>
          <Input id={`email-${serviceSlug}`} name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
        </Field>
        <Field label="Company (optional)" htmlFor={`company-${serviceSlug}`}>
          <Input id={`company-${serviceSlug}`} name="company" autoComplete="organization" placeholder="Business name" />
        </Field>
      </div>

      <Field label="Budget range" htmlFor={`budget-${serviceSlug}`}>
        <select
          id={`budget-${serviceSlug}`}
          name="budget"
          className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          defaultValue="Not sure yet"
        >
          <option>Under ₹50,000</option>
          <option>₹50,000 – ₹2,00,000</option>
          <option>₹2,00,000 – ₹10,00,000</option>
          <option>₹10,00,000+</option>
          <option>Not sure yet</option>
        </select>
      </Field>

      <Field label="Project / requirement" htmlFor={`message-${serviceSlug}`} error={errors.message}>
        <Textarea
          id={`message-${serviceSlug}`}
          name="message"
          required
          placeholder="Goals, timeline, current setup…"
          className="min-h-[120px]"
        />
      </Field>

      <Button type="submit" variant="gradient" size="lg" loading={submitting} disabled={submitting} className="w-full sm:w-auto">
        <Send className="h-4 w-4" /> {submitting ? "Sending..." : "Request a quote"}
      </Button>
    </form>
  );
}
