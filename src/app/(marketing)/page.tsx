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
  Sparkles,
  Star,
  GraduationCap,
  Plus,
  Minus,
  Target,
  Users,
  Zap,
  Award,
} from "lucide-react";
import { services, stats, partners, siteConfig } from "@/config/site";
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
    a: "Yes. We offer maintenance retainings for updates, security patches, performance monitoring and ongoing content changes. Support plans are flexible and month-to-month.",
  },
  {
    q: "Do you work with clients outside Hyderabad?",
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
  { icon: Award, title: "Internship-grade quality", desc: "The same team that trains 300+ interns builds client projects — standards are non-negotiable." },
];

export default function HomePage() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent("Hi, I'm interested in your services and would like to discuss a project.")}`;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" className="mb-5 px-3 py-1 text-xs">
              <Sparkles className="h-3 w-3" /> Premium Digital Growth Studio
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              We build <span className="text-gradient">growth engines</span> for ambitious brands
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Akradhii designs, develops and automates — websites, Meta Ads, CRMs, AI workflows, SEO and
              branding — and trains the next generation of digital professionals through structured internships.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                <Link href="/contact" className="flex items-center gap-2">
                  Start your project <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/internships" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> Join an internship
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card/60 p-5 text-center backdrop-blur">
                <p className="text-2xl font-extrabold text-gradient sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Partners */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by growing brands
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
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Badge variant="primary" className="mb-4">About Akradhii</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Building digital experiences that move businesses forward
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Akradhii is a Hyderabad-based digital growth studio working with startups, SMBs and growing brands
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
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Services built for growth</h2>
          <p className="mt-4 text-muted-foreground">
            Seven disciplines, one integrated team — so your brand, website and campaigns move together.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = icons[s.icon as keyof typeof icons] ?? Code2;
            return (
              <Reveal key={s.id} delay={i * 0.05}>
                <Link href={`/services/${s.id}`}>
                  <Card className="group h-full p-6 transition-all hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-600/10">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25">
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
            <Card className="flex h-full flex-col justify-center bg-gradient-to-br from-violet-700 to-indigo-700 p-6 text-white">
              <h3 className="text-lg font-semibold">Not sure where to start?</h3>
              <p className="mt-2 text-sm text-white/80">Tell us your goal — we&apos;ll map the fastest path to it.</p>
              <Button className="mt-5 self-start bg-white text-violet-700 hover:bg-white/90">
                <Link href="/contact" className="flex items-center gap-2">Book a free audit <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Internships */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="primary" className="mb-3"><GraduationCap className="h-3 w-3" /> Internship programs</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn by doing. Graduate portfolio-ready.</h2>
            <p className="mt-4 text-muted-foreground">
              Structured programs with live mentorship, real projects and verifiable certificates.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {PROGRAMS.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <Card className={`relative flex h-full flex-col p-6 ${p.featured ? "border-brand-500/60 shadow-xl shadow-brand-600/10" : ""}`}>
                  {p.featured && (
                    <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white">
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
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Badge variant="primary" className="mb-3">Our work</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Selected projects</h2>
            <p className="mt-3 text-muted-foreground">Selected work we&apos;ve created for businesses and brands — with real numbers.</p>
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

      {/* Testimonials */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Loved by clients and interns</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.slice(0, 6).map((t, i) => (
              <Reveal key={t.id} delay={i * 0.05}>
                <Card className="h-full p-6">
                  <div className="flex gap-0.5 text-warning">
                    {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
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

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know before starting your project with us.
          </p>
        </Reveal>
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqItems.map((item, i) => (
            <Reveal key={i} delay={i * 0.03}>
              <FaqItem question={item.q} answer={item.a} defaultOpen={i === 0} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Categories strip */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
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
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-blue-700 p-10 text-center text-white sm:p-16">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative">
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to grow with Akradhii?</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/80">
                Whether you need a growth partner for your business or a career-defining internship — we&apos;re ready.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90">
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

      {/* Floating WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group fixed bottom-5 right-5 z-50 flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/40 sm:bottom-6 sm:right-6 sm:h-[62px] sm:w-[62px]"
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-20" />
        <svg viewBox="0 0 32 32" fill="currentColor" className="relative h-7 w-7">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.058 9.374L1.054 31.29l6.118-1.97A15.907 15.907 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.318 22.594c-.39 1.094-1.932 2.004-3.154 2.27-.834.18-1.924.322-5.596-1.202-4.7-1.95-7.724-6.72-7.954-7.026-.224-.306-1.836-2.44-1.836-4.656 0-2.214 1.16-3.3 1.572-3.764.39-.434.936-.554 1.246-.554.312 0 .624.002.894.016.288.014.676-.108 1.056.806.39.94 1.324 3.232 1.44 3.464.116.232.194.504.038.81-.156.306-.232.496-.464.764-.232.268-.488.598-.694.804-.232.232-.472.484-.202.948.272.464 1.206 1.986 2.59 3.218 1.778 1.586 3.276 2.078 3.74 2.31.464.232.736.194 1.008-.116.272-.31 1.156-1.346 1.464-1.81.306-.464.616-.384 1.042-.232.428.156 2.714 1.28 3.182 1.514.466.232.776.348.894.54.116.2.116 1.15-.274 2.244z" />
        </svg>
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 sm:block">
          Chat with us on WhatsApp
        </span>
      </a>
    </>
  );
}

function FaqItem({ question, answer, defaultOpen = false }: { question: string; answer: string; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-border bg-card/50 backdrop-blur">
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
