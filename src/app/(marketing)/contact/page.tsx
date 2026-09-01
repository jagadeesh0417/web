"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone, Send, Calendar, CheckCircle2, X, AlertTriangle } from "lucide-react";
import { siteConfig, services } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Field } from "@/components/ui/input";
import { Reveal } from "@/components/marketing/reveal";
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
      if (value.trim() && !phoneSchema.safeParse(value).success) return "Please enter a valid 10-digit Indian phone number.";
      return undefined;
    case "topic":
      if (!value) return "Please select a service.";
      return undefined;
    case "message":
      if (!value.trim()) return "Project details are required.";
      if (value.trim().length < 20) return "Please provide at least 20 characters.";
      return undefined;
    default:
      return undefined;
  }
}

export default function ContactPage() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const waHref = `https://wa.me/${siteConfig.whatsapp}`;

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
    const topic = String(data.get("topic") ?? "").trim();
    const budget = String(data.get("budget") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const nextErrors: Record<string, string> = {};
    const nameErr = validateField("name", name);
    const emailErr = validateField("email", email);
    const phoneErr = validateField("phone", phone);
    const topicErr = validateField("topic", topic);
    const messageErr = validateField("message", message);
    if (nameErr) nextErrors.name = nameErr;
    if (emailErr) nextErrors.email = emailErr;
    if (phoneErr) nextErrors.phone = phoneErr;
    if (topicErr) nextErrors.topic = topicErr;
    if (messageErr) nextErrors.message = messageErr;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const result = await submitLead({
      formType: "contact",
      source: "Contact Page",
      page: "Contact",
      pagePath: "/contact",
      website: honeypot,
      fields: { name, email, phone, company, topic, service: topic, budget, message },
    });
    setSubmitting(false);

    if (!result.ok) {
      setServerError("Something went wrong. Please try WhatsApp or email hello@akradhii.com.");
      return;
    }

    setSent(true);
    formRef.current?.reset();
    toast("success", "Message Sent Successfully", "We'll get back to you within 24 hours.");
  };

  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="primary" className="mb-4">Contact</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Let&apos;s build something together</h1>
            <p className="mt-4 text-muted-foreground">
              Project enquiries, partnerships or internship questions — we reply within 24 hours on business days.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <span className="text-sm text-muted-foreground">Prefer to talk first?</span>
              <a href="https://calendly.com/akradhii" target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Book a 15-min call <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <Card className="h-full p-6">
              <h2 className="text-lg font-semibold">Reach us directly</h2>
              <div className="mt-6 space-y-5">
                {[
                  { icon: Mail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
                  { icon: Phone, label: "Phone", value: siteConfig.phone, href: `tel:${siteConfig.phone.replace(/\s/g, "")}` },
                  { icon: MessageCircle, label: "WhatsApp", value: siteConfig.whatsappDisplay, href: waHref },
                  { icon: MapPin, label: "Office", value: siteConfig.address },
                  { icon: Clock, label: "Working hours", value: siteConfig.workingHours },
                ].map((c) => (
                  <div key={c.label} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600/10 text-brand-400">
                      <c.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
                      {c.href ? (
                        <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noreferrer" : undefined} className="text-sm font-medium hover:text-brand-400">
                          {c.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-medium">Where we are available</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Studio based in {siteConfig.city}, {siteConfig.region}, {siteConfig.country}. We also support remote client engagements across India and internationally.
                </p>
              </div>
              <div className="mt-4 rounded-xl border border-brand-500/30 bg-brand-600/5 p-4">
                <p className="text-sm font-medium">Internship enquiries</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Prefer the guided application at{" "}
                  <Link href="/internships/apply" className="text-brand-400 hover:underline">/internships/apply</Link>.
                </p>
              </div>
            </Card>
            <div className="mt-6 overflow-hidden rounded-xl border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.2!2d78.38!3d17.44!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae3a4e1c5e3e3e3e!2sHITEC%20City%2C%20Hyderabad%2C%20Telangana%20500081!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%" height="300" style={{ border: 0 }} allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" title="Akradhii office location" className="w-full"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <Card className="p-6 sm:p-8">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold">Message sent!</h2>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Thanks for reaching out. We&apos;ll reply within 24 hours on business days.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="relative space-y-5" noValidate>
                  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0">
                    <label htmlFor="website">Website</label>
                    <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  </div>

                  {serverError && (
                    <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <div className="flex-1">
                        <p className="font-medium text-destructive">{serverError}</p>
                        <p className="mt-1 text-muted-foreground">Please try WhatsApp or email <a href={`mailto:${siteConfig.email}`} className="font-medium text-brand-400 hover:underline">{siteConfig.email}</a>.</p>
                      </div>
                      <button type="button" onClick={() => setServerError(null)} className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name" htmlFor="name" error={errors.name}>
                      <Input id="name" name="name" required autoComplete="name" placeholder="Your name" onBlur={handleBlur} />
                    </Field>
                    <Field label="Email" htmlFor="email" error={errors.email}>
                      <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" onBlur={handleBlur} />
                    </Field>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Phone" htmlFor="phone" error={errors.phone}>
                      <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 98485 79053" onBlur={handleBlur} />
                    </Field>
                    <Field label="Company (optional)" htmlFor="company">
                      <Input id="company" name="company" autoComplete="organization" placeholder="Your company" />
                    </Field>
                  </div>
                  <Field label="I'm interested in" htmlFor="topic" error={errors.topic}>
                    <select id="topic" name="topic" className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" defaultValue="Website Design & Development" onBlur={handleBlur}>
                      {services.map((s) => (
                        <option key={s.id}>{s.title}</option>
                      ))}
                      <option>Internship program</option>
                      <option>Something else</option>
                    </select>
                  </Field>
                  <Field label="Budget range" htmlFor="budget">
                    <select id="budget" name="budget" className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" defaultValue="Not sure yet">
                      <option>Under ₹50,000</option>
                      <option>₹50,000 – ₹2,00,000</option>
                      <option>₹2,00,000 – ₹10,00,000</option>
                      <option>₹10,00,000+</option>
                      <option>Not sure yet</option>
                    </select>
                  </Field>
                  <Field label="Project details" htmlFor="message" error={errors.message}>
                    <Textarea id="message" name="message" required placeholder="Tell us about your project, timeline and goals..." className="min-h-[140px]" onBlur={handleBlur} />
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
    </div>
  );
}
