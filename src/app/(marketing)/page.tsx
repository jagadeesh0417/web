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
  Sparkles,
  Star,
  GraduationCap,
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

export default function HomePage() {
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
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-60">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Trusted by</span>
            {partners.map((p) => (
              <span key={p} className="text-lg font-bold text-muted-foreground">{p}</span>
            ))}
          </div>
        </div>
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

      {/* Portfolio preview */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Recent work</h2>
            <p className="mt-3 text-muted-foreground">Real results for real clients — with numbers.</p>
          </div>
          <Button variant="outline">
            <Link href="/our-work" className="flex items-center gap-2">View all projects <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {portfolioItems.slice(0, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <Link href={`/portfolio/${p.slug}`}>
                <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${p.gradient}`}>
                    <span className="text-4xl font-black text-white/30 group-hover:scale-125 transition-transform">A</span>
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
    </>
  );
}
