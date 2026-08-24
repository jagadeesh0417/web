"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Field } from "@/components/ui/input";
import { Reveal } from "@/components/marketing/reveal";
import { useToast } from "@/components/ui/toast";
import { submitLead } from "@/lib/leads/client";
import { emailSchema, nameSchema, phoneSchema } from "@/lib/validators";

export default function ContactPage() {
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
    const topic = String(data.get("topic") ?? "").trim();
    const budget = String(data.get("budget") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const nextErrors: Record<string, string> = {};
    const nameRes = nameSchema.safeParse(name);
    if (!nameRes.success) nextErrors.name = nameRes.error.issues[0]?.message ?? "Enter your name";
    const emailRes = emailSchema.safeParse(email);
    if (!emailRes.success) nextErrors.email = "Please enter a valid email address.";
    if (phone) {
      const phoneRes = phoneSchema.safeParse(phone);
      if (!phoneRes.success) nextErrors.phone = "Please enter a valid phone number.";
    }
    if (!message || message.length < 5) nextErrors.message = "Please tell us a bit about your project.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const result = await submitLead({
      formType: "contact",
      source: "Contact Page",
      page: "Contact",
      pagePath: "/contact",
      website: honeypot,
      fields: {
        name,
        email,
        phone,
        company,
        topic,
        service: topic,
        budget,
        message,
      },
    });
    setSubmitting(false);

    if (!result.ok) {
      toast("error", "Something went wrong. Please try again.", result.error ?? "");
      return;
    }

    setSent(true);
    formEl.reset();
    toast("success", "Message Sent Successfully", "We'll get back to you within 24 hours.");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge variant="primary" className="mb-4">Contact us</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Let&apos;s build something great</h1>
        <p className="mt-4 text-muted-foreground">
          Tell us about your project, your goals or your internship questions. We reply within 24 hours.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-10 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <Card className="h-full p-6">
            <h2 className="text-lg font-semibold">Reach us directly</h2>
            <div className="mt-6 space-y-5">
              {[
                { icon: Mail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
                { icon: Phone, label: "Phone", value: siteConfig.phone, href: `tel:${siteConfig.phone.replace(/\s/g, "")}` },
                { icon: MapPin, label: "Office", value: siteConfig.address },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600/10 text-brand-500">
                    <c.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-sm font-medium hover:text-brand-500">{c.value}</a>
                    ) : (
                      <p className="text-sm font-medium">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-xl border border-brand-500/30 bg-brand-600/5 p-4">
              <p className="text-sm font-medium">Internship enquiries</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Applications are handled in the portal. Explore programs at{" "}
                <Link href="/internships" className="text-brand-500 hover:underline">/internships</Link>.
              </p>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-3">
          <Card className="p-6 sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-16 w-16 text-success" />
                <h2 className="mt-4 text-2xl font-bold">Message Sent Successfully</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Thanks for reaching out. Our team will respond within 24 hours.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative space-y-5" noValidate>
                {/* Honeypot — hidden from users */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="name" error={errors.name}>
                    <Input id="name" name="name" required autoComplete="name" placeholder="Your name" aria-invalid={!!errors.name} />
                  </Field>
                  <Field label="Email" htmlFor="email" error={errors.email}>
                    <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" aria-invalid={!!errors.email} />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Phone" htmlFor="phone" error={errors.phone}>
                    <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" aria-invalid={!!errors.phone} />
                  </Field>
                  <Field label="Company (optional)" htmlFor="company">
                    <Input id="company" name="company" autoComplete="organization" placeholder="Your company" />
                  </Field>
                </div>
                <Field label="I'm interested in" htmlFor="topic">
                  <select
                    id="topic"
                    name="topic"
                    className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                    defaultValue="Website Design & Development"
                  >
                    <option>Website Design & Development</option>
                    <option>Meta Ads</option>
                    <option>Business Automation</option>
                    <option>CRM Solutions</option>
                    <option>AI Automation</option>
                    <option>SEO</option>
                    <option>Branding</option>
                    <option>Internship program</option>
                    <option>Something else</option>
                  </select>
                </Field>
                <Field label="Budget range" htmlFor="budget">
                  <select
                    id="budget"
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
                <Field label="Project details" htmlFor="message" error={errors.message}>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Tell us about your project, timeline and goals..."
                    className="min-h-[140px]"
                    aria-invalid={!!errors.message}
                  />
                </Field>
                <Button type="submit" variant="gradient" size="lg" loading={submitting} disabled={submitting} className="w-full sm:w-auto">
                  <Send className="h-4 w-4" /> {submitting ? "Sending..." : "Send message"}
                </Button>
              </form>
            )}
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
