import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Megaphone,
  Workflow,
  Database,
  BrainCircuit,
  Search,
  Palette,
  CheckCircle2,
  GraduationCap,
  Plus,
  Minus,
  Target,
  Users,
  Zap,
  Award,
  Lightbulb,
  Rocket,
  BarChart3,
  HeartHandshake,
  Sparkles,
  Star,
  Quote,
  MessageCircle,
  Phone,
} from "lucide-react";
import { services, siteConfig } from "@/config/site";
import { PROGRAMS, CATEGORIES } from "@/lib/constants";
import { publicPortfolio as portfolioItems } from "@/lib/data/public-portfolio";
import { testimonials } from "@/lib/data/sample-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  alternates: { canonical: siteConfig.url },
};

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Megaphone,
  Workflow,
  Database,
  BrainCircuit,
  Search,
  Palette,
};

const faqItems = [
  {
    q: "What services does Akradhii provide?",
    a: "We design and develop websites, run Meta Ads campaigns, build CRM pipelines, implement AI automation, handle SEO, and create brand identities. Every engagement is tailored to the client's business goals — no cookie-cutter solutions.",
  },
  {
    q: "What type of websites do you build?",
    a: "Corporate sites, SaaS landing pages, e-commerce stores, custom web applications and portfolio platforms. We work with Next.js, React, WordPress and headless CMS stacks depending on what the project actually needs.",
  },
  {
    q: "Can you build a completely custom website?",
    a: "Yes. From wireframes to deployment, we design and develop every project from scratch — custom UI, custom backend logic, custom integrations. Nothing is forced into a pre-built template.",
  },
  {
    q: "How long does a website project take?",
    a: "A landing page can ship in 1–2 weeks. A full business website or e-commerce build typically takes 4–8 weeks. Duration depends on scope, number of pages, functionality, content readiness and revision cycles.",
  },
  {
    q: "How much does a website cost?",
    a: "Pricing depends on requirements — pages, features, integrations and timeline. Contact us for a scoped estimate. We keep proposals transparent with no hidden line items.",
  },
  {
    q: "Do you redesign existing websites?",
    a: "Absolutely. We audit the current site, identify conversion and performance gaps, then redesign with a focus on speed, UX and business outcomes — not just visual refresh.",
  },
  {
    q: "Do you provide support after launch?",
    a: "Yes. We offer maintenance retainers for updates, security patches, performance monitoring and ongoing content changes. Support plans are flexible and month-to-month.",
  },
  {
    q: "Do you work with clients outside Bengaluru?",
    a: "Yes. We work with clients across India and internationally. Every project runs through structured communication — Slack, Notion, weekly calls — so location is never a blocker.",
  },
  {
    q: "How do I start a project with Akradhii?",
    a: "Reach out through the contact form or WhatsApp. We start with a discovery call, define scope and goals, send a proposal, then move into design and development. Simple and structured.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Discovery",
    desc: "We understand your business, audience, competitors and success metrics before writing a line of code.",
    icon: Lightbulb,
  },
  {
    step: "02",
    title: "Strategy",
    desc: "We map the technology stack, channel mix and milestones that connect directly to your growth goals.",
    icon: Target,
  },
  {
    step: "03",
    title: "Design",
    desc: "Wireframes become high-fidelity interfaces built for clarity, trust and conversion.",
    icon: Palette,
  },
  {
    step: "04",
    title: "Development",
    desc: "Clean, scalable engineering with performance, security and SEO baked in from day one.",
    icon: Code2,
  },
  {
    step: "05",
    title: "Launch",
    desc: "Rigorous QA, analytics instrumentation and a coordinated go-live plan.",
    icon: Rocket,
  },
  {
    step: "06",
    title: "Growth",
    desc: "Continuous optimization through ads, SEO, automation and data-driven iterations.",
    icon: BarChart3,
  },
];

const strengths = [
  {
    icon: HeartHandshake,
    title: "End-to-end ownership",
    desc: "Strategy, design, engineering and growth under one roof — no handoff gaps or conflicting agencies.",
  },
  {
    icon: Users,
    title: "Senior-led delivery",
    desc: "Experienced practitioners lead every phase. Your project is never outsourced to a junior bench.",
  },
  {
    icon: Zap,
    title: "Speed without shortcuts",
    desc: "Fast iteration cycles with quality gates. We ship quickly and we ship right.",
  },
  {
    icon: BarChart3,
    title: "Outcome accountability",
    desc: "Clear KPIs, transparent reporting and decisions driven by business results — not vanity metrics.",
  },
  {
    icon: Sparkles,
    title: "Future-ready systems",
    desc: "Scalable architecture, AI automation and integrated tooling that grow with your business.",
  },
  {
    icon: Award,
    title: "Real-world learning culture",
    desc: "Our internship programs keep the team sharp and bring fresh thinking into client work.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#423020]/40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgba(245,130,22,.18),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_80%,rgba(244,189,83,.10),transparent_45%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-12 pt-12 sm:px-8 lg:grid-cols-[48%_52%] lg:px-12 lg:pt-20">
          <div className="relative z-10 animate-fade-up">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#F4BD53]">
              — Bengaluru digital growth studio —
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.55rem]">
              We Build Digital Experiences That{" "}
              <span className="text-gradient">Move Businesses Forward.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#B7B4AE] sm:text-base">
              Akradhii partners with startups and growing brands to design high-converting websites, run
              performance campaigns, automate operations and build brand identities that last.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#F4BD53] via-[#F58216] to-[#C75A19] px-6 text-sm font-bold text-[#090A0D] shadow-lg shadow-orange-900/30 transition hover:brightness-110"
              >
                Start a Project <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D6A24A] bg-[#111216] px-6 text-sm font-bold text-[#F7F4EF] transition hover:shadow-[0_0_18px_#f5821640]"
              >
                Explore Our Work <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-[#423020]/60 pt-6 text-xs font-medium text-[#F7F4EF] sm:grid-cols-4">
              {[
                { icon: Zap, label: "Business Growth" },
                { icon: Award, label: "Trusted & Reliable" },
                { icon: Users, label: "Expert Team" },
                { icon: Target, label: "Result Driven" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-[#F4BD53]" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Agency introduction */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <Badge variant="primary" className="mb-4">
              About Akradhii
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Your partner for sustainable digital growth
            </h2>
            <div className="mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-[#F4BD53] via-[#F58216] to-[#C75A19]" />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Akradhii is a Bengaluru-based digital growth studio working with startups, SMBs and growing brands
              across India. We combine strategy, design, development and performance marketing into a single
              integrated workflow — so brands don&apos;t need five agencies to get results.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Our team ships high-converting websites, runs data-driven Meta Ads campaigns, builds CRM pipelines,
              implements AI automation and crafts brand identities that stick. Every project is led by senior
              practitioners and shaped around real business outcomes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="gradient">
                <Link href="/about" className="flex items-center gap-2">
                  Learn more about us <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline">
                <Link href="/contact" className="flex items-center gap-2">
                  Start your project <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Strategy", desc: "Clear roadmaps tied to business goals." },
                { title: "Design", desc: "Premium, conversion-focused interfaces." },
                { title: "Engineering", desc: "Fast, scalable, maintainable code." },
                { title: "Growth", desc: "SEO, ads and automation that compound." },
              ].map((x) => (
                <Card key={x.title} className="border-border/60 bg-card/50 p-5 transition hover:border-brand-500/40">
                  <h3 className="font-semibold text-[#F4BD53]">{x.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{x.desc}</p>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#F4BD53]">— Our services</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Complete digital solutions for modern businesses
            </h2>
            <p className="mt-4 text-muted-foreground">
              Seven disciplines, one integrated team — so your brand, website and campaigns move together.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => {
              const Icon = icons[s.icon as keyof typeof icons] ?? Code2;
              return (
                <Reveal key={s.id} delay={i * 0.05}>
                  <Link href={`/services/${s.id}`}>
                    <Card className="group h-full p-6 transition-all hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-600/10">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#423020] bg-[#222329] text-[#F4BD53]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {s.features.slice(0, 3).map((f) => (
                          <Badge key={f} variant="outline">
                            {f}
                          </Badge>
                        ))}
                      </div>
                      <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-500 opacity-0 transition-opacity group-hover:opacity-100">
                        Explore service <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Card>
                  </Link>
                </Reveal>
              );
            })}
            <Reveal delay={0.35}>
              <Card className="flex h-full flex-col justify-center bg-gradient-to-br from-[#423020] to-[#18191F] p-6 text-white">
                <h3 className="text-lg font-semibold">Not sure where to start?</h3>
                <p className="mt-2 text-sm text-white/80">
                  Tell us your goal — we&apos;ll map the fastest path to it.
                </p>
                <Button className="mt-5 self-start bg-[#F4BD53] text-[#090A0D] hover:bg-[#F58216]">
                  <Link href="/contact" className="flex items-center gap-2">
                    Book a free audit <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured portfolio */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#F4BD53]">— Featured work</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Selected projects</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Client-approved case studies are prepared and published only after independent verification.
            </p>
          </div>
          <Button variant="outline">
            <Link href="/portfolio" className="flex items-center gap-2">
              View all projects <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </Reveal>

        {portfolioItems.length === 0 ? (
          <Reveal delay={0.1}>
            <Card className="mt-12 flex flex-col items-center justify-between gap-6 p-8 text-center sm:flex-row sm:text-left">
              <div>
                <h3 className="text-xl font-bold">Case studies are being prepared for publication</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We only publish verified, client-approved work. In the meantime, tell us about your project and we&apos;ll share relevant examples directly.
                </p>
              </div>
              <Button variant="gradient">
                <Link href="/contact" className="flex items-center gap-2">
                  Discuss your project <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </Reveal>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioItems.slice(0, 6).map((p, i) => (
              <Reveal key={p.id} delay={i * 0.06}>
                <Link href={`/portfolio/${p.slug}`}>
                  <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-600/10">
                    <div
                      className={cn(
                        "relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br",
                        p.gradient,
                      )}
                    >
                      <span className="text-5xl font-black text-white/30 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-125">
                        A
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {p.service}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{p.year}</span>
                      </div>
                      <h3 className="mt-2 font-semibold transition-colors group-hover:text-brand-500">{p.title}</h3>
                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{p.summary}</p>
                      <div className="mt-3 flex gap-4">
                        {p.results.map((r) => (
                          <div key={r.label}>
                            <p className="text-sm font-bold text-brand-500">{r.value}</p>
                            <p className="text-[10px] text-muted-foreground">{r.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* Workflow */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#F4BD53]">— How we work</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">A process built for clarity and speed</h2>
            <p className="mt-4 text-muted-foreground">
              Six intentional phases that take you from idea to impact without surprises.
            </p>
          </Reveal>

          <div className="relative mt-14">
            <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-brand-500/60 via-brand-600/30 to-transparent md:left-1/2" />
            <div className="space-y-10 md:space-y-0">
              {workflow.map((w, i) => {
                const Icon = w.icon;
                const isEven = i % 2 === 0;
                return (
                  <Reveal key={w.step} delay={i * 0.08}>
                    <div className="relative md:grid md:grid-cols-2 md:gap-12">
                      <div
                        className={cn(
                          "pl-16 md:pl-0",
                          isEven ? "md:col-start-1 md:text-right" : "md:col-start-2 md:text-left",
                        )}
                      >
                        <div className={cn("max-w-sm", isEven && "md:ml-auto")}>
                          <span className="text-xs font-bold uppercase tracking-widest text-brand-500">{w.step}</span>
                          <h3 className="mt-1 text-xl font-bold">{w.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{w.desc}</p>
                        </div>
                      </div>

                      <div className="absolute left-6 top-0 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-[#423020] bg-[#111216] text-[#F4BD53] shadow-lg md:left-1/2">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Akradhii */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#F4BD53]">— Why Akradhii</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Built for businesses that want results</h2>
          <p className="mt-4 text-muted-foreground">
            Capabilities and strengths that show up in every engagement — not just the pitch deck.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {strengths.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 0.05}>
                <Card className="h-full p-6 transition hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-600/10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F4BD53] to-[#F58216] text-[#090A0D]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Internships */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="primary" className="mb-3">
              <GraduationCap className="h-3 w-3" /> Internship programs
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Learn by doing. Graduate portfolio-ready.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Structured programs with live mentorship, real projects and completion certificates.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PROGRAMS.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <Card
                  className={cn(
                    "relative flex h-full flex-col p-6",
                    p.featured && "border-brand-500/60 shadow-xl shadow-brand-600/10",
                  )}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-[#F4BD53] to-[#C75A19] px-3 py-1 text-xs font-bold text-[#090A0D]">
                      Most popular
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{p.title}</h3>
                    <Badge variant={p.featured ? "primary" : "default"}>{p.duration}</Badge>
                  </div>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                    <div>
                      <p className="text-lg font-bold">₹{p.price.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground">one-time</p>
                    </div>
                    <Button variant={p.featured ? "gradient" : "outline"} size="sm">
                      <Link href={`/internships/apply?program=${p.slug}`}>Apply now</Link>
                    </Button>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 text-center">
            <Button variant="ghost">
              <Link href="/internships" className="flex items-center gap-2">
                Explore all {CATEGORIES.length} categories <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#F4BD53]">— Testimonials</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Loved by clients and interns</h2>
          <p className="mt-4 text-muted-foreground">Real feedback from the people we work with.</p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((t, i) => (
            <Reveal key={t.id} delay={i * 0.05}>
              <Card className="h-full p-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-warning">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-brand-500/20" />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                      t.gradient,
                    )}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#F4BD53]">— FAQ</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Frequently asked questions</h2>
            <p className="mt-4 text-muted-foreground">Everything you need to know before starting your project with us.</p>
          </Reveal>

          <div className="mx-auto mt-12 max-w-3xl space-y-3">
            {faqItems.map((item, i) => (
              <Reveal key={i} delay={i * 0.03}>
                <FaqItem question={item.q} answer={item.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-[#754421] bg-gradient-to-br from-[#423020] via-[#18191F] to-[#111216] p-10 text-center text-white sm:p-16">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#F58216]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#F4BD53]/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">Ready to move your business forward?</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/80">
                Whether you need a growth partner for your business or a career-defining internship — we&apos;re ready.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#F4BD53] px-6 text-sm font-bold text-[#090A0D] shadow-lg shadow-orange-900/30 transition hover:bg-[#F58216]"
                >
                  <MessageCircle className="h-4 w-4" /> Talk to us
                </Link>
                <Link
                  href={`https://wa.me/${siteConfig.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/40 bg-white/5 px-6 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" /> WhatsApp us
                </Link>
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  <Link href="/internships">Apply for internship</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-border bg-card/50 backdrop-blur">
      <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-sm font-semibold leading-snug marker:hidden list-none select-none">
        <span>{question}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-open:bg-brand-500 group-open:text-white">
          <Plus className="h-3.5 w-3.5 transition-transform group-open:hidden" />
          <Minus className="hidden h-3.5 w-3.5 transition-transform group-open:block" />
        </span>
      </summary>
      <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{answer}</div>
    </details>
  );
}
