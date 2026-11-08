"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Field } from "@/components/ui/input";
import { Reveal } from "@/components/marketing/reveal";
import { useToast } from "@/components/ui/toast";

const TOPICS = [
  "Website Design & Development",
  "Meta Ads",
  "Business Automation",
  "CRM Solutions",
  "AI Automation",
  "SEO",
  "Branding",
  "Internship program",
  "Something else",
];

const TOPIC_BY_SERVICE: Record<string, string> = {
  "web-development": "Website Design & Development",
  "meta-ads": "Meta Ads",
  automation: "Business Automation",
  crm: "CRM Solutions",
  "ai-automation": "AI Automation",
  seo: "SEO",
  branding: "Branding",
};

function ContactForm() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState<string>(
    TOPIC_BY_SERVICE[searchParams.get("service") ?? ""] ?? TOPICS[0],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      toast("success", "Message sent", `We'll get back to ${String(data.get("email"))} within 24 hours.`);
    }, 900);
  };

  return (
    <Card className="p-6 sm:p-8">
      {sent ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="h-16 w-16 text-success" />
          <h2 className="mt-4 text-2xl font-bold">Message sent!</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Thanks for reaching out. Our team will respond within 24 hours.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
            Send another message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="name">
              <Input id="name" name="name" required placeholder="Your name" />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" required placeholder="you@company.com" />
            </Field>
          </div>
          <Field label="I'm interested in" htmlFor="topic">
            <select
              id="topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Budget range" htmlFor="budget">
            <select id="budget" name="budget" className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30">
              <option>Under ₹50,000</option>
              <option>₹50,000 – ₹2,00,000</option>
              <option>₹2,00,000 – ₹10,00,000</option>
              <option>₹10,00,000+</option>
              <option>Not sure yet</option>
            </select>
          </Field>
          <Field label="Project details" htmlFor="message">
            <Textarea id="message" name="message" required placeholder="Tell us about your project, timeline and goals..." className="min-h-[140px]" />
          </Field>
          <Button type="submit" variant="gradient" size="lg" loading={submitting} className="w-full sm:w-auto">
            <Send className="h-4 w-4" /> Send message
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function ContactPage() {
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
          <Suspense fallback={<Card className="p-6 sm:p-8" />}>
            <ContactForm />
          </Suspense>
        </Reveal>
      </div>
    </div>
  );
}
