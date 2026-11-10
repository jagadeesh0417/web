import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart2,
  BookOpen,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  FileText,
  GraduationCap,
  Lock,
  Palette,
  PenTool,
  PlayCircle,
  Search,
  Send,
  TrendingUp,
  Unlock,
  Video,
  Zap,
} from "lucide-react";
import { PROGRAMS, CATEGORIES } from "@/lib/constants";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { formatCurrency } from "@/lib/utils";
import { internshipFaq } from "@/lib/data/internship-faq";

export const metadata: Metadata = {
  title: "Internships",
  description:
    "Build skills, ship projects and earn a completion certificate. 4, 6 and 8-week Akradhii internship programs across 10 tracks.",
  keywords: [
    "internship program india",
    "web development internship",
    "digital marketing internship",
    "UI/UX design internship",
    "data science internship",
  ],
  openGraph: {
    title: "Internships",
    description: "Structured internship programs with modules, projects, assessment and completion certificates.",
    url: `${siteConfig.url}/internships`,
    images: [
      {
        url: `${siteConfig.url}/og-default.svg`,
        width: 1200,
        height: 630,
        alt: "Akradhii Internships",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${siteConfig.url}/og-default.svg`],
  },
  alternates: { canonical: `${siteConfig.url}/internships` },
};

const trackIcons: Record<string, React.ElementType> = {
  "web-development": Code2,
  "ui-ux-design": Palette,
  "meta-ads": TrendingUp,
  "digital-marketing": BarChart2,
  automation: Zap,
  "ai-automation": Bot,
  "graphic-design": PenTool,
  "content-writing": FileText,
  seo: Search,
  "video-editing": Video,
};

const comparisonFeatures = [
  { label: "Duration", foundation: PROGRAMS[0].duration, professional: PROGRAMS[1].duration, industry: PROGRAMS[2].duration },
  { label: "Live sessions", foundation: "4", professional: "6", industry: "Contact support" },
  { label: "Assignments", foundation: "4", professional: "8", industry: "Contact support" },
  { label: "Projects", foundation: "1 mini", professional: "2", industry: "Client-based" },
  { label: "Weekly assessments", foundation: "Contact support", professional: "Included", industry: "Contact support" },
  { label: "Performance report", foundation: "Contact support", professional: "Included", industry: "Contact support" },
  { label: "Mentor support", foundation: "Included", professional: "Included", industry: "Full mentorship" },
  { label: "Certificate", foundation: "Included", professional: "Included", industry: "Included" },
  { label: "Price", foundation: formatCurrency(PROGRAMS[0].price), professional: formatCurrency(PROGRAMS[1].price), industry: formatCurrency(PROGRAMS[2].price) },
];

const learningFlow = [
  { step: "01", title: "Choose program", text: "Pick a category track that matches your career goals.", icon: GraduationCap },
  { step: "02", title: "Choose duration", text: "Foundation (4), Professional (6) or Industry (8) weeks.", icon: BookOpen },
  { step: "03", title: "Enroll", text: "Complete the application and secure your seat with payment.", icon: Send },
  { step: "04", title: "Get access", text: "Activate your account and open the student dashboard.", icon: Unlock },
  { step: "05", title: "Learn", text: "Watch lessons, read notes and join live sessions where scheduled.", icon: PlayCircle },
  { step: "06", title: "Complete weekly tasks", text: "Build assignments and mini-projects each week.", icon: ClipboardCheck },
  { step: "07", title: "Submit work", text: "Share Drive, GitHub, Figma or Canva links for mentor review.", icon: Send },
  { step: "08", title: "Unlock next module", text: "Finish lessons and get assignments approved to progress.", icon: Lock },
  { step: "09", title: "Final assessment", text: "Complete the final assessment according to your plan's criteria.", icon: ClipboardCheck },
  { step: "10", title: "Certificate", text: "Receive a certificate of completion when eligible.", icon: Award },
];

export default async function InternshipsPage({ searchParams }: { searchParams: Promise<{ q?: string; track?: string }> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const selectedTrack = typeof params.track === "string" ? params.track : "";
  const tracks = CATEGORIES.filter((c) => (!selectedTrack || c.slug === selectedTrack) && [c.name, c.description, ...c.skills].join(" ").toLowerCase().includes(query.toLowerCase()));
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "ItemList", itemListElement: PROGRAMS.map((p, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Course", name: p.title, description: p.description, provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url }, offers: { "@type": "Offer", price: p.price, priceCurrency: "INR", url: `${siteConfig.url}/internships/apply?program=${p.slug}` } } })) },
      { "@type": "FAQPage", mainEntity: internshipFaq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" className="mb-4">
              <GraduationCap className="h-3 w-3" /> Internships at Akradhii
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Build a portfolio with mentor feedback.{" "}
              <span className="text-gradient">Earn a completion certificate.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              For students and freshers: develop practical skills through projects, assignments and feedback. Choose from {CATEGORIES.length} tracks and {PROGRAMS.length} plans.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/internships/apply?program=professional" className="inline-flex h-12 items-center rounded-lg bg-violet-600 px-6 font-medium text-white hover:bg-violet-700 focus-visible:ring-2 focus-visible:ring-white">Apply now</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Duration plans */}
      <section id="programs" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose your duration</h2>
          <p className="mt-3 text-muted-foreground">
            Same quality bar across plans — more weeks mean more modules, projects and mentorship depth.
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
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  <Badge variant={p.featured ? "primary" : "default"}>{p.duration}</Badge>
                </div>
                <p className="mt-3 text-sm leading-relaxed">{p.description}</p>
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
                    <p className="text-xl font-bold">{formatCurrency(p.price)}</p>
                    <p className="text-xs text-muted-foreground">one-time</p>
                  </div>
                  <Button variant={p.featured ? "gradient" : "outline"}>
                    <Link href={`/internships/apply?program=${p.slug}`}>Apply now</Link>
                  </Button>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
        <h2 className="text-2xl font-bold">Next batch</h2>
        <p className="mt-3 text-muted-foreground">Batch dates and availability have not yet been published. Contact us to ask about the next intake.</p>
        <a className="mt-5 inline-block rounded-lg border border-border px-5 py-3 focus-visible:ring-2 focus-visible:ring-brand-500" href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent("Hello, I would like to enquire about the next internship batch.")}`}>Enquire on WhatsApp</a>
      </section>

      {/* Feature comparison table */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Compare plans</h2>
          <p className="mt-3 text-muted-foreground">
            Side-by-side breakdown so you can pick the right fit.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-10 hidden overflow-x-auto rounded-xl border border-border md:block">
            <table className="w-full min-w-[600px] text-sm">
              <caption className="sr-only">Internship plan comparison</caption>
              <thead>
                <tr className="border-b border-border bg-gradient-to-r from-violet-700 to-indigo-700 text-white">
                  <th scope="col" className="px-5 py-4 text-left font-semibold">Feature</th>
                  <th scope="col" className="px-5 py-4 text-center font-semibold">Foundation</th>
                  <th scope="col" className="relative px-5 py-4 text-center font-semibold">
                    Professional
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-violet-700 shadow">Most popular</span>
                  </th>
                  <th scope="col" className="px-5 py-4 text-center font-semibold">Industry</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((f, i) => (
                  <tr key={f.label} className={`border-b border-border ${i % 2 === 0 ? "bg-card/50" : "bg-card/30"}`}>
                    <th scope="row" className="px-5 py-3.5 text-left font-medium">{f.label}</th>
                    {(["foundation", "professional", "industry"] as const).map((plan) => {
                      const val = f[plan];
                      return (
                        <td key={plan} className="px-5 py-3.5 text-center">
                          <span className={plan === "professional" ? "font-semibold" : ""}>{val}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 grid gap-4 md:hidden">
            {(["foundation", "professional", "industry"] as const).map((plan) => (
              <section key={plan} className={`rounded-xl border p-5 ${plan === "professional" ? "border-brand-500" : "border-border"}`}>
                <h3 className="font-bold capitalize">{plan}{plan === "professional" ? " · Most popular" : ""}</h3>
                <dl className="mt-3 space-y-2 text-sm">{comparisonFeatures.map((f) => <div key={f.label} className="flex justify-between gap-3"><dt>{f.label}</dt><dd className="text-right">{f[plan]}</dd></div>)}</dl>
              </section>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Categories / programs */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Internship tracks</h2>
            <p className="mt-3 text-muted-foreground">
              Each track has its own curriculum, mentor focus and project style. Open a page for skills, FAQs and apply links.
            </p>
          </Reveal>
          <form action="/internships#tracks" method="get" className="mx-auto mt-8 flex max-w-xl flex-wrap gap-2">
            <label htmlFor="track-search" className="sr-only">Search internship tracks</label>
            <input id="track-search" name="q" type="search" defaultValue={query} placeholder="Search tracks or skills" className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2" />
            <button type="submit" className="rounded-lg bg-violet-600 px-4 py-2 text-white">Search</button>
            <Link href="/internships#tracks" className="rounded-lg border border-border px-4 py-2">Clear</Link>
          </form>
          <div id="tracks" className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Filter by track">
            <Link href="/internships#tracks" aria-current={!selectedTrack ? "true" : undefined} className="rounded-full border border-border px-3 py-1 text-sm">All tracks</Link>
            {CATEGORIES.map((c) => <Link key={c.slug} href={`/internships?track=${encodeURIComponent(c.slug)}#tracks`} aria-current={selectedTrack === c.slug ? "true" : undefined} className={`rounded-full border px-3 py-1 text-sm ${selectedTrack === c.slug ? "border-brand-500 bg-brand-600/20" : "border-border"}`}>{c.name}</Link>)}
          </div>
          <p className="mt-4 text-center text-sm" aria-live="polite">{tracks.length} tracks found</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.map((c) => {
              const Icon = trackIcons[c.slug] || GraduationCap;
              return (
                <div key={c.id}>
                  <Link href={`/internships/${c.slug}`}>
                    <Card className="group h-full p-6 transition-all hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.gradient} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-semibold">{c.name}</h3>
                    <p className="mt-2 text-sm">4–8 weeks</p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {c.skills.slice(0, 3).map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-400">
                      View program <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Card>
                </Link>
                </div>
            );
            })}
          </div>
        </div>
      </section>

      {/* Learning flow */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Learning journey</h2>
          <p className="mt-3 text-muted-foreground">
            From program selection to a completion certificate — aligned with the student dashboard.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {learningFlow.map((f, i) => (
            <Reveal key={f.step} delay={i * 0.03}>
              <Card className="relative h-full p-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-brand-500/25">{f.step}</span>
                  <f.icon className="h-4 w-4 text-brand-400" />
                </div>
                <h3 className="mt-2 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">{f.text}</p>
                {i < learningFlow.length - 1 && i !== 4 && (
                  <span className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground/30 max-lg:hidden">→</span>
                )}
                {i === 4 && (
                  <span className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 text-lg font-bold text-muted-foreground/30 max-lg:hidden">↓</span>
                )}
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <h2 className="text-3xl font-bold">What every intern receives</h2>
              <ul className="mt-6 space-y-3">
                {[
                  "Dashboard access with modules and lessons",
                  "Weekly project assignments with mentor review",
                  "Progressive unlocking when work is approved",
                  "Final assessment with clear pass criteria",
                  "Certificate of completion",
                  "Offer letter and payment invoice in the portal",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.08}>
              <Card className="p-6 sm:p-8">
                <h3 className="font-semibold">Already enrolled?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign in to continue modules, submit work and track certificate eligibility.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="gradient">
                    <Link href="/login">Student login</Link>
                  </Button>
                  <Button variant="outline">
                    <Link href="/verify">Verify a certificate</Link>
                  </Button>
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        </Reveal>
        <div className="mt-8 space-y-3">
            {internshipFaq.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border bg-card p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
                {f.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted-foreground">Read our <Link className="underline" href="/terms">terms</Link> or <Link className="underline" href="/contact">contact support</Link> for policy details.</p>
      </section>

      {/* Verify certificate */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="flex items-center gap-2 text-brand-400">
                <Award className="h-5 w-5" />
                <h2 className="text-3xl font-bold tracking-tight">Verify your certificate</h2>
              </div>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Online verification is not yet available. Contact support to request manual verification.
              </p>
              <div className="mt-6">
                <Button variant="gradient">
                  <Link href="/verify">Verify a certificate</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <Card className="p-6 sm:p-8">
                <h3 className="font-semibold">How verification works</h3>
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-muted-foreground">Email {siteConfig.supportEmail} with the certificate ID and a copy of the certificate.</p>
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Reveal>
          <Card className="bg-gradient-to-br from-violet-700 to-indigo-700 p-10 text-center text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to start your internship?</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/85">
              Pick a track and duration — applications open year-round.
            </p>
            <Button size="lg" className="mt-6 bg-white text-violet-800 hover:bg-white/90">
              <Link href="/internships/apply" className="flex items-center gap-2">
                Apply now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
