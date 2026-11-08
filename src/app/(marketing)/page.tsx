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
  Star,
  GraduationCap,
  Quote,
} from "lucide-react";
import { services, stats, partners } from "@/config/site";
import { PROGRAMS, CATEGORIES } from "@/lib/constants";
import { testimonials } from "@/lib/data/sample-data";
import { portfolioItems } from "@/lib/data/sample-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { Avatar } from "@/components/ui/avatar";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2, Megaphone, Workflow, Database, BrainCircuit, Search, Palette,
};

function SectionHeading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{children}</h2>
      <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500" />
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </Reveal>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40 bg-grid-fade" />
        <div className="absolute inset-0 bg-glow" />
        <div className="aurora-blob -left-32 -top-24 h-96 w-96 bg-orange-500/20" />
        <div className="aurora-blob -right-24 top-6 h-[26rem] w-[26rem] bg-amber-400/15" style={{ animationDelay: "-5s" }} />
        <div className="aurora-blob -bottom-36 left-1/3 h-80 w-80 bg-amber-600/15" style={{ animationDelay: "-10s" }} />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
                DIGITAL • AUTOMATION • MARKETING • GROWTH
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Digital Solutions That{" "}
                <span className="text-gradient">Grow Your Business</span>
              </h1>
              <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
                Website Development, Digital Marketing, AI Automation and CRM Solutions to help you attract
                customers, streamline operations and scale faster.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                  <Link href="/contact" className="flex items-center gap-2">
                    Get a Free Consultation <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/portfolio" className="flex items-center gap-2">
                    See Our Work <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.15} className="relative">
              <div className="relative mx-auto max-w-md rounded-3xl border border-border bg-card/60 p-6 shadow-2xl shadow-orange-600/10 backdrop-blur">
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-amber-500/20 via-transparent to-orange-600/20" />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-700 text-sm font-black text-white">
                      A
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Akradhii Growth Dashboard</p>
                      <p className="text-xs text-muted-foreground">Illustrative preview</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <div className="flex items-end gap-2">
                      {[30, 45, 38, 60, 52, 75, 68, 90].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-orange-600 to-amber-400" style={{ height: h + "px" }} />
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">Monthly growth trend (illustrative)</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "Leads", value: "128" },
                      { label: "Conversion", value: "4.2%" },
                      { label: "Revenue", value: "Rs 12.4L" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-xl border border-border bg-background/40 p-3">
                        <p className="text-lg font-bold text-amber-400">{m.value}</p>
                        <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={0.15 + i * 0.07}>
                <div className="animate-float rounded-2xl border border-border/60 bg-card/70 p-5 text-center shadow-lg shadow-orange-600/5 backdrop-blur-xl transition-all hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-xl hover:shadow-orange-600/15">
                  <p className="text-gradient text-2xl font-extrabold sm:text-3xl">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="border-y border-border bg-card/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Result-Driven Strategies",
              "End-to-End Digital Solutions",
              "Experienced Team",
              "Reliable & Scalable Support",
            ].map((b) => (
              <div key={b} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 via-orange-500 to-amber-700 text-xs font-black text-white">
                  ✓
                </span>
                <span className="text-sm font-medium">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="border-y border-border bg-card/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by
          </p>
          <div className="marquee-hover-pause relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
            <div className="animate-marquee flex w-max items-center gap-14">
              {[...partners, ...partners].map((p, i) => (
                <span key={i} className="whitespace-nowrap text-lg font-bold text-muted-foreground/60 transition-colors hover:text-brand-500">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Internship promo */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-amber-500/10 p-6 backdrop-blur sm:p-8 lg:flex-row lg:items-center">
            <div className="aurora-blob -right-16 -top-20 h-56 w-56 bg-brand-500/20 dark:bg-brand-500/15" />
            <div className="relative">
              <Badge variant="primary" className="mb-2.5">
                <GraduationCap className="h-3 w-3" /> Internships at Akradhii
              </Badge>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                Launch your career — internship programs from <span className="text-gradient-animated">₹1,999</span>
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                4, 6 &amp; 8-week tracks with live mentorship, real projects, assessments and a verifiable certificate.
              </p>
            </div>
            <div className="relative flex flex-col items-start gap-2 lg:items-end">
              <Button variant="gradient" size="lg">
                <Link href="/internships" className="flex items-center gap-2">
                  Explore internships <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <span className="text-xs text-muted-foreground">10 categories · 300+ interns trained · 500+ certificates</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading sub="A complete suite of digital solutions to build, market, automate and grow your business.">
          Everything You Need for Digital Growth
        </SectionHeading>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = icons[s.icon as keyof typeof icons] ?? Code2;
            return (
              <Reveal key={s.id} delay={i * 0.05}>
                <Card className="glow-card group flex h-full flex-col overflow-hidden p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/25 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Link href={`/services#${s.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1">
                      Learn more <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <Link href={`/services#${s.id}`}>
                    <h3 className="mt-5 text-lg font-semibold transition-colors group-hover:text-brand-500">{s.title}</h3>
                  </Link>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {s.features.slice(0, 3).map((f) => (
                      <Badge key={f} variant="outline">{f}</Badge>
                    ))}
                  </div>
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
                    <div>
                      <p className="text-base font-extrabold text-foreground">
                        ₹{s.pricing.basic.toLocaleString("en-IN")}
                        <span className="ml-1 text-xs font-medium text-muted-foreground">basic</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Premium from ₹{s.pricing.premium.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Link href={`/contact?service=${s.id}`}>Get a quote</Link>
                    </Button>
                  </div>
                </Card>
              </Reveal>
            );
          })}
          <Reveal delay={0.35}>
            <Card className="relative flex h-full flex-col justify-center overflow-hidden bg-gradient-to-br from-amber-700 via-orange-700 to-orange-700 p-6 text-white">
              <div className="aurora-blob -right-16 -top-16 h-48 w-48 bg-white/15" />
              <div className="relative">
                <h3 className="text-lg font-semibold">Not sure where to start?</h3>
                <p className="mt-2 text-sm text-white/80">Tell us your goal — we&apos;ll map the fastest path to it.</p>
                <Button className="btn-shine mt-5 self-start bg-white text-amber-700 hover:bg-white/90">
                  <Link href="/contact" className="flex items-center gap-2">Book a free audit <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">ABOUT AKRADHII</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Partner for Sustainable Business Growth</h2>
            <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-700" />
            <p className="mt-4 text-muted-foreground">
              Akradhii helps businesses build, market, automate and grow. We combine strategy, design,
              development and performance marketing into one integrated workflow — so you don&apos;t need five
              agencies to get results.
            </p>
            <p className="mt-3 text-muted-foreground">
              We serve startups, SMBs and growing brands with high-converting websites, data-driven Meta Ads,
              CRM pipelines, AI automation and brand identities. Every project is led by senior practitioners.
            </p>
            <Button variant="outline" className="mt-6">
              <Link href="/about" className="flex items-center gap-2">Learn more <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Strategy", desc: "Clear roadmaps tied to business goals." },
                { title: "Design", desc: "Premium, conversion-focused interfaces." },
                { title: "Engineering", desc: "Fast, scalable, maintainable code." },
                { title: "Growth", desc: "SEO, ads and automation that compound." },
              ].map((x) => (
                <div key={x.title} className="rounded-2xl border border-border bg-card/60 p-5">
                  <h3 className="font-semibold text-amber-400">{x.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{x.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Internships */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="primary" className="mb-3"><GraduationCap className="h-3 w-3" /> Internship programs</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn Practical Skills. Build Your Future.</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500" />
            <p className="mt-4 text-muted-foreground">
              Structured programs with live mentorship, real projects and verifiable certificates.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PROGRAMS.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <Card className={`relative flex h-full flex-col p-6 transition-all hover:-translate-y-1.5 ${p.featured ? "gradient-border gradient-border-animated shadow-xl shadow-brand-600/10" : "hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-600/10"}`}>
                  {p.featured && (
                    <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-amber-600/30">
                      Most popular
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{p.title}</h3>
                    <Badge variant={p.featured ? "primary" : "default"}>{p.durationWeeks} weeks</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {p.includes.map((inc) => (
                      <li key={inc} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {inc}
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
                Explore all 10 categories <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* AI Automation feature */}
      <section className="border-y border-border bg-[#0B0C10]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">AI AUTOMATION</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Automate. Optimize. Scale.</h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-700" />
            <p className="mt-4 text-muted-foreground">
              Leverage AI-powered tools, intelligent workflows and business integrations to reduce repetitive work
              and improve operational efficiency.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "AI Chatbots",
              "Workflow Automation",
              "Custom AI Agents",
              "Business Integrations",
              "Lead Qualification",
              "Customer Support Automation",
            ].map((f, i) => (
              <Reveal key={f} delay={i * 0.05}>
                <div className="rounded-2xl border border-border bg-card/60 p-6 transition-all hover:-translate-y-1 hover:border-amber-500/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-700 text-white shadow-lg shadow-orange-600/20">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Business outcomes first — automation that saves time and reduces manual effort.
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio preview */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Real Projects. Real Results.</h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500" />
            <p className="mt-3 text-muted-foreground">Real results for real clients — with numbers.</p>
          </div>
          <Button variant="outline">
            <Link href="/portfolio" className="flex items-center gap-2">View all projects <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {portfolioItems.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <Link href={`/portfolio/${p.slug}`}>
                <Card className="glow-card group h-full overflow-hidden p-0">
                  <div className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br ${p.gradient}`}>
                    <span className="text-4xl font-black text-white/30 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-150">A</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{p.service}</p>
                    <h3 className="mt-1 font-semibold">{p.title}</h3>
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
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading>Loved by clients and interns</SectionHeading>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 6).map((t, i) => (
              <Reveal key={t.id} delay={i * 0.05}>
                <Card className="glow-card h-full p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5 text-warning">
                      {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                    </div>
                    <Quote className="h-6 w-6 text-brand-500/20" />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                    <Avatar name={t.name} />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Categories strip */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading sub="Ten specializations, each with its own mentor, curriculum and live sessions.">
          Pick your track
        </SectionHeading>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.03}>
              <Link href={`/internships/${c.slug}`}>
                <Badge variant="outline" className="px-4 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500 hover:bg-brand-500/5 hover:text-brand-500 hover:shadow-lg hover:shadow-brand-600/10">
                  {c.name}
                </Badge>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-700 via-orange-700 to-orange-700 p-10 text-center text-white sm:p-16">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="aurora-blob -left-20 -top-20 h-64 w-64 bg-white/10" />
            <div className="aurora-blob -bottom-24 -right-16 h-72 w-72 bg-amber-400/20" style={{ animationDelay: "-8s" }} />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-sweep bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="relative">
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to Take Your Business to the Next Level?</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/80">
                Let&apos;s discuss your goals and explore the right digital solutions for your business.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="btn-shine bg-white text-amber-700 hover:bg-white/90">
                  <Link href="/contact" className="flex items-center gap-2">Talk to us <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  <Link href="/internships">Apply for internship</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
