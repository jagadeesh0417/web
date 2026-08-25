import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Layers,
  Rocket,
  Users,
} from "lucide-react";
import { services, siteConfig, partners } from "@/config/site";
import { servicesHub } from "@/config/services-detail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { ServiceIcon } from "@/components/services/service-icons";

export const metadata: Metadata = {
  title: "Company | Akradhii",
  description:
    "Akradhii is a digital growth studio in Hyderabad — websites, Meta Ads, automation, CRM, AI, SEO, branding and structured internship programs.",
  openGraph: {
    title: "Company | Akradhii",
    description: siteConfig.description,
    url: `${siteConfig.url}/company`,
  },
  alternates: { canonical: `${siteConfig.url}/company` },
};

const approach = [
  { title: "Discover", text: "Goals, constraints, audience and success metrics before any build begins." },
  { title: "Design the system", text: "Architecture, messaging and process — not just screens or ad sets." },
  { title: "Ship in milestones", text: "Visible progress, demos and feedback loops instead of big-bang delivery." },
  { title: "Measure & improve", text: "Analytics, iteration and support so the work keeps compounding." },
];

const audiences = [
  "Startups launching or rebuilding their digital presence",
  "Small and mid-size businesses generating leads online",
  "E-commerce and D2C brands scaling acquisition",
  "Service businesses and professional firms",
  "Education and training organizations",
  "Teams that want both delivery and internship talent pipelines",
];

const capabilities = [
  "Next.js / React web apps",
  "Meta Ads & creative testing",
  "CRM setup & pipelines",
  "Workflow automation",
  "AI assistants & RAG",
  "Technical SEO",
  "Brand systems",
  "Internship LMS & certificates",
];

export default function CompanyPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" className="mb-4">
              <Building2 className="h-3 w-3" /> Company
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {siteConfig.name} — a digital growth studio
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              We help ambitious brands ship websites, campaigns and automations that convert — and we train the next generation of digital professionals through structured internships.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="gradient" size="lg">
                <Link href="/contact" className="flex items-center gap-2">
                  Work with us <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/services" className="flex items-center gap-2">Explore our services</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight">What we do</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Akradhii operates as an integrated digital partner: strategy, design, engineering and growth under one roof. We solve fragmented vendor stacks, slow websites, untracked ads and manual operations — so founders and teams can focus on the product and customers.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Based in {siteConfig.city}, we work with startups, SMBs and growing brands across India and remote engagements worldwide.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <Card className="p-6 sm:p-8">
              <h3 className="font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand-400" /> Core expertise
              </h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {services.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/services/${s.id}`}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-brand-500/40 hover:bg-muted/40"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Business areas</h2>
            <p className="mt-3 text-muted-foreground">Client delivery and career programs — designed to reinforce each other.</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {servicesHub.slice(0, 7).map((s, i) => (
              <Reveal key={s.id} delay={i * 0.03}>
                <Link href={`/services/${s.id}`}>
                  <Card className="h-full p-5 transition-all hover:border-brand-500/40">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white`}>
                      <ServiceIcon name={s.icon} className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
                  </Card>
                </Link>
              </Reveal>
            ))}
            <Reveal delay={0.28}>
              <Link href="/internships">
                <Card className="flex h-full flex-col justify-center bg-gradient-to-br from-violet-700 to-indigo-700 p-5 text-white">
                  <Rocket className="h-8 w-8" />
                  <h3 className="mt-3 text-sm font-semibold">Internships & education</h3>
                  <p className="mt-1 text-xs text-white/80">Structured programs with projects, assessment and verifiable certificates.</p>
                </Card>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Our approach</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {approach.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.05}>
              <Card className="h-full p-5">
                <span className="text-xs font-bold text-brand-400">0{i + 1}</span>
                <h3 className="mt-2 font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="flex items-center gap-2 text-brand-400">
                <Users className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Who we serve</h2>
              </div>
              <ul className="mt-6 space-y-3">
                {audiences.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="text-2xl font-bold">Capabilities & platforms</h2>
              <p className="mt-2 text-sm text-muted-foreground">Representative stack — final tools are chosen per engagement.</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {capabilities.map((c) => (
                  <span key={c} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">
                    {c}
                  </span>
                ))}
              </div>
              <p className="mt-8 text-xs font-medium uppercase tracking-wide text-muted-foreground">Teams we&apos;ve worked with</p>
              <div className="mt-3 flex flex-wrap gap-4 opacity-70">
                {partners.map((p) => (
                  <span key={p} className="text-sm font-bold text-muted-foreground">{p}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Why work with us</h2>
          <p className="mt-3 text-muted-foreground">
            Integrated delivery, transparent process and a training arm that keeps our craft sharp.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { t: "One team, full stack", d: "Design, build and growth in one conversation — fewer handoffs, faster decisions." },
            { t: "Business-first delivery", d: "We optimize for leads, conversion and operations — not vanity deliverables." },
            { t: "Clear communication", d: "Milestones, demos and plain-language reporting your leadership can use." },
          ].map((w, i) => (
            <Reveal key={w.t} delay={i * 0.05}>
              <Card className="h-full p-6">
                <h3 className="font-semibold">{w.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.d}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <Card className="bg-gradient-to-br from-violet-700 to-indigo-700 p-10 text-center text-white sm:p-14">
            <h2 className="text-2xl font-bold sm:text-3xl">Have a project in mind? Let&apos;s talk.</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">
              Tell us your goals — we&apos;ll map a practical path across services, timeline and budget.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="bg-white text-violet-800 hover:bg-white/90">
                <Link href="/contact" className="flex items-center gap-2">
                  Contact us <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                <Link href="/about">About the team</Link>
              </Button>
            </div>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
