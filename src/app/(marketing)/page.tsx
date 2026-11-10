import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { services, partners } from "@/config/site";
import { PROGRAMS, CATEGORIES } from "@/lib/constants";
import { publicPortfolio as portfolioItems } from "@/lib/data/public-portfolio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.akradhii.com" },
};

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2, Megaphone, Workflow, Database, BrainCircuit, Search, Palette,
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

const values = [
  { icon: Target, title: "Results-first", desc: "Every decision ties back to measurable business outcomes — traffic, leads, revenue." },
  { icon: Users, title: "Senior-led teams", desc: "No junior handoffs. Senior strategists, designers and engineers own your project end to end." },
  { icon: Zap, title: "Speed without shortcuts", desc: "Fast iteration cycles with quality gates. We ship quickly and we ship right." },
  { icon: Award, title: "Practical learning", desc: "Structured internship programs combine learning with project work." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="order-1 relative overflow-hidden border-b border-[#423020]/40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_55%,rgba(197,90,25,.24),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-4 px-5 pb-9 pt-12 sm:px-8 lg:grid-cols-[46%_54%] lg:px-12 lg:pt-16">
          <div className="relative z-10 animate-fade-up">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#F4BD53]">— Digital transformation partner —</p>
            <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-[1.03] tracking-tight sm:text-5xl lg:text-[3.55rem]">Digital Solutions That <span className="text-gradient">Grow Your Business</span></h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#B7B4AE] sm:text-base">We build powerful websites, automate operations with AI, create strong brand identities, and support business growth through digital solutions.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex min-h-11 items-center gap-3 rounded-full bg-gradient-to-r from-[#F4BD53] via-[#F58216] to-[#C75A19] px-6 text-sm font-bold text-[#090A0D] shadow-lg shadow-orange-900/30 transition hover:brightness-110">Get a Free Consultation <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/portfolio" className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-[#D6A24A] bg-[#111216] px-6 text-sm font-bold text-[#F7F4EF] transition hover:shadow-[0_0_18px_#f5821640]">See Our Work <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="relative -mx-5 overflow-hidden sm:mx-0 lg:-mr-12">
            <Image src="/reference-hero.webp" width={554} height={310} alt="Illustrative laptop and analytics dashboard with orange light trails" priority className="h-auto w-full rounded-lg object-cover" />
            <span className="absolute bottom-2 right-3 rounded bg-black/80 px-2 py-1 text-[10px] text-white">Illustrative dashboard</span>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-[#423020]/60 pt-6 text-xs font-medium text-[#F7F4EF] sm:grid-cols-4 lg:col-span-2">
            {[{ icon: Zap, label: "Business Growth" }, { icon: Award, label: "Trusted & Reliable" }, { icon: Users, label: "Expert Team" }, { icon: Target, label: "Result Driven" }].map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-2"><Icon className="h-5 w-5 text-[#F4BD53]" />{label}</div>)}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="hidden border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by growing brands (case studies available on request)
          </p>
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-card/40 to-transparent" />
            <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-card/40 to-transparent" />
            <div className="flex animate-marquee gap-0">
              {[...partners, ...partners].map((p, i) => (
                <span key={`${p}-${i}`} className="flex shrink-0 items-center gap-6 px-6">
                  <span className="text-sm font-semibold tracking-widest text-[#c0c8d8] uppercase">{p}</span>
                  <span className="text-muted-foreground/40">&middot;</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About the Company */}
      <section className="order-4 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge variant="primary" className="mb-4">About Akradhii</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Building digital experiences that move businesses forward
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Akradhii is a Bengaluru-based digital growth studio working with startups, SMBs and growing brands
            across India. We combine strategy, design, development and performance marketing into a single
            integrated workflow — so brands don&apos;t need five agencies to get results.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Our team ships high-converting websites, runs data-driven Meta Ads campaigns, builds CRM
            pipelines, implements AI automation and crafts brand identities that stick. Every project is
            led by senior practitioners — not outsourced to the lowest bidder.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left sm:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card/50 p-4">
                <v.icon className="h-5 w-5 text-brand-500" />
                <p className="mt-2 text-sm font-semibold">{v.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="gradient">
              <Link href="/about" className="flex items-center gap-2">Learn more about us <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button variant="outline">
              <Link href="/contact" className="flex items-center gap-2">Start your project <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-[#423020]"><Image src="/reference-about.webp" width={535} height={241} alt="Illustration of a dark office reception with warm gold lighting" className="h-auto w-full" /><span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-[10px] text-white">Illustration</span></div>
        </div>
      </section>

      {/* Services */}
      <section className="order-2 mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-[#F4BD53]">— Our services</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Complete Digital Solutions for Modern Businesses</h2>
          <p className="mt-4 text-muted-foreground">
            Seven disciplines, one integrated team — so your brand, website and campaigns move together.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                        <Badge key={f} variant="outline">{f}</Badge>
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
              <p className="mt-2 text-sm text-white/80">Tell us your goal — we&apos;ll map the fastest path to it.</p>
              <Button className="mt-5 self-start bg-[#F4BD53] text-[#090A0D] hover:bg-[#F58216]">
                <Link href="/contact" className="flex items-center gap-2">Book a free audit <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="order-3 mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-[#754421] bg-[#111216] md:grid-cols-2">
          <Image src="/reference-ai.webp" width={510} height={148} alt="Illustration of a robotic hand reaching toward a human hand" className="h-full min-h-40 w-full object-cover" />
          <div className="p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-widest text-[#F4BD53]">— AI-powered growth</p><h2 className="mt-2 text-3xl font-bold">Automate. Optimize. Scale.</h2><p className="mt-3 text-sm text-[#B7B4AE]">Explore AI assistants and workflows designed to support your business operations.</p><Link className="mt-5 inline-flex rounded-full bg-gradient-to-r from-[#F4BD53] to-[#F58216] px-5 py-3 text-sm font-bold text-[#090A0D]" href="/services/ai-automation">Explore AI Solutions <ArrowRight className="ml-2 h-4 w-4" /></Link></div>
        </div>
      </section>

      {/* Internships */}
      <section className="order-6 border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="primary" className="mb-3"><GraduationCap className="h-3 w-3" /> Internship programs</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn by doing. Graduate portfolio-ready.</h2>
            <p className="mt-4 text-muted-foreground">
              Structured programs with live mentorship, real projects and completion certificates.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PROGRAMS.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <Card className={`relative flex h-full flex-col p-6 ${p.featured ? "border-brand-500/60 shadow-xl shadow-brand-600/10" : ""}`}>
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
                Explore all 10 categories <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Selected Projects */}
      <section className="order-5 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge variant="primary" className="mb-3">Our work</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Selected projects</h2>
            <p className="mt-3 text-muted-foreground">Client-approved case studies are being prepared for publication.</p>
          </div>
          <Button variant="outline">
            <Link href="/portfolio" className="flex items-center gap-2">View all projects <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.slice(0, 6).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <Link href={`/portfolio/${p.slug}`}>
                <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-600/10">
                  <div className={`relative flex h-48 items-center justify-center bg-gradient-to-br ${p.gradient} overflow-hidden`}>
                    <Image
                      src={`/portfolio/${p.slug}.svg`}
                      alt={`${p.title} — ${p.service}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{p.service}</Badge>
                      <span className="text-[10px] text-muted-foreground">{p.year}</span>
                    </div>
                    <h3 className="mt-2 font-semibold group-hover:text-brand-500 transition-colors">{p.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{p.summary}</p>
                    <div className="mt-3 flex gap-4">
                      {p.results.map((r) => (
                        <div key={r.label}>
                          <p className="text-sm font-bold text-brand-500">{r.value}</p>
                          <p className="text-[10px] text-muted-foreground">{r.label}</p>
                        </div>
                      ))}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-500 opacity-0 transition-opacity group-hover:opacity-100">
                      View project <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="order-7 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know before starting your project with us.
          </p>
        </Reveal>
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqItems.map((item, i) => (
            <Reveal key={i} delay={i * 0.03}>
              <FaqItem question={item.q} answer={item.a} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Categories strip */}
      <section className="order-8 mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pick your track</h2>
          <p className="mt-4 text-muted-foreground">Ten specializations, each with its own mentor, curriculum and live sessions.</p>
        </Reveal>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.03}>
              <Link href={`/internships/${c.slug}`}>
                <Badge variant="outline" className="px-4 py-2 text-sm transition-all hover:border-brand-500 hover:text-brand-500">
                  {c.name}
                </Badge>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="order-9 mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-[#754421] bg-gradient-to-br from-[#423020] via-[#18191F] to-[#111216] p-10 text-center text-white sm:p-16">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative">
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to grow with Akradhii?</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/80">
                Whether you need a growth partner for your business or a career-defining internship — we&apos;re ready.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="bg-[#F4BD53] text-[#090A0D] hover:bg-[#F58216]">
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
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-border bg-card/50 backdrop-blur">
      <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-sm font-semibold leading-snug select-none marker:hidden list-none">
        <span>{question}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border transition-colors group-open:bg-brand-500 group-open:text-white">
          <Plus className="h-3.5 w-3.5 transition-transform group-open:hidden" />
          <Minus className="h-3.5 w-3.5 hidden transition-transform group-open:block" />
        </span>
      </summary>
      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
