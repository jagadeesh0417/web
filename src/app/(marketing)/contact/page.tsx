"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send, Calendar, CheckCircle2, X, AlertTriangle } from "lucide-react";
import { siteConfig, services } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Field } from "@/components/ui/input";
import { Reveal } from "@/components/marketing/reveal";
import { useToast } from "@/components/ui/toast";
import { submitLead } from "@/lib/leads/client";
import { contactFormSchema } from "@/lib/validators";

function validateField(name: string, value: string): string | undefined {
  const field = contactFormSchema.shape[name as keyof typeof contactFormSchema.shape];
  if (!field) return undefined;
  const result = field.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export default function ContactPage() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [serviceQuery, setServiceQuery] = useState("");
  const [hoursStatus, setHoursStatus] = useState("");

  useEffect(() => {
    setServiceQuery(new URLSearchParams(window.location.search).get("service")?.slice(0, 200) ?? "");
    const updateHours = () => {
      const ist = new Date(Date.now() + 330 * 60_000);
      const day = ist.getUTCDay();
      const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
      if (day !== 0 && minutes >= 600 && minutes < 1140) {
        setHoursStatus("Open now");
      } else {
        const next = day === 0 || (day === 6 && minutes >= 1140) ? "Monday" : minutes < 600 ? "today" : "tomorrow";
        setHoursStatus(`Closed · opens ${next} at 10:00 AM IST`);
      }
    };
    updateHours();
    const timer = window.setInterval(updateHours, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const waText = serviceQuery ? `Hello, I would like to discuss ${serviceQuery}.` : "Hello, I would like to discuss a project.";
  const waHref = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(waText)}`;

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
    const timeline = String(data.get("timeline") ?? "").trim();

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
    if (Object.keys(nextErrors).length > 0) {
      formEl.querySelector<HTMLElement>(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }

    setSubmitting(true);
    const result = await submitLead({
      formType: "contact",
      source: "Contact Page",
      page: "Contact",
      pagePath: "/contact",
      website: honeypot,
      fields: { name, email, phone, company, topic, service: topic, budget, timeline, message },
    });
    setSubmitting(false);

    if (!result.ok) {
      setServerError(`Something went wrong. Please try WhatsApp or email ${siteConfig.email}.`);
      return;
    }

    setSent(true);
    formRef.current?.reset();
    toast("success", "Message received", "Thank you for contacting us.");
  };

  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="primary" className="mb-4">Contact</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Let&apos;s build something together</h1>
            <p className="mt-4 text-muted-foreground">
              Project enquiries, partnerships or internship questions — we would love to hear from you.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <span className="text-sm text-muted-foreground">Prefer to talk first?</span>
              <a className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:text-brand-400" href={`mailto:${siteConfig.email}?subject=${encodeURIComponent("Request a discovery call")}&body=${encodeURIComponent("Hello, I would like to arrange a call. My preferred times are: ")}`}>
                <Calendar className="h-4 w-4" /> Request a discovery call
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
              {hoursStatus && <p className="mt-2 text-sm text-muted-foreground">{hoursStatus}</p>}
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
              <div className="mt-6 rounded-xl border border-border p-4">
                <a className="text-sm font-medium text-brand-400 hover:underline" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address)}`} target="_blank" rel="noreferrer">Get directions on Google Maps <span className="sr-only">(opens in a new tab)</span></a>
              </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <Card className="p-6 sm:p-8">
              {sent ? (
                <div role="status" className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </div>
                    <h2 className="mt-5 text-2xl font-bold">Message received!</h2>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Thanks for reaching out. We&apos;ll be in touch.
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
                    <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <div className="flex-1">
                        <p className="font-medium text-destructive">{serverError}</p>
                        <p className="mt-1 text-muted-foreground">Please try WhatsApp or email <a href={`mailto:${siteConfig.email}`} className="font-medium text-brand-400 hover:underline">{siteConfig.email}</a>.</p>
                      </div>
                      <button type="button" aria-label="Dismiss error" onClick={() => setServerError(null)} className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name" htmlFor="name" error={errors.name}>
                      <Input id="name" name="name" required autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} placeholder="Your name" onBlur={handleBlur} />
                    </Field>
                    <Field label="Email" htmlFor="email" error={errors.email}>
                      <Input id="email" name="email" type="email" inputMode="email" required autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} placeholder="you@company.com" onBlur={handleBlur} />
                    </Field>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Phone" htmlFor="phone" error={errors.phone}>
                      <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} placeholder="+91 98485 79053" onBlur={handleBlur} />
                    </Field>
                    <Field label="Company (optional)" htmlFor="company">
                      <Input id="company" name="company" autoComplete="organization" placeholder="Your company" />
                    </Field>
                  </div>
                  <Field label="I'm interested in" htmlFor="topic" error={errors.topic}>
                    <select id="topic" name="topic" required aria-invalid={!!errors.topic} aria-describedby={errors.topic ? "topic-error" : undefined} className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" defaultValue="" onBlur={handleBlur}>
                      <option value="">Select a service</option>
                      {services.map((s) => (
                        <option key={s.id}>{s.title}</option>
                      ))}
                      <option>Internship program</option>
                      <option>Something else</option>
                    </select>
                  </Field>
                  <Field label="Budget (optional)" htmlFor="budget">
                    <Input id="budget" name="budget" placeholder="Share a range if you have one" />
                  </Field>
                  <Field label="Timeline (optional)" htmlFor="timeline">
                    <Input id="timeline" name="timeline" placeholder="When would you like to start?" />
                  </Field>
                  <Field label="Project details" htmlFor="message" error={errors.message}>
                    <Textarea id="message" name="message" required aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} placeholder="Tell us about your project, timeline and goals..." className="min-h-[140px]" onBlur={handleBlur} />
                  </Field>
                  <p className="text-xs text-muted-foreground">By submitting, you acknowledge our <Link href="/privacy" className="text-brand-400 underline">Privacy Policy</Link>.</p>
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
