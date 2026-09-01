import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Compass,
  Eye,
  HeartHandshake,
  Layers,
  Lightbulb,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { siteConfig, services, partners } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { BlogListing } from "@/components/marketing/blog-listing";
import { blogPosts } from "@/lib/data/sample-data";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story, mission, vision and values behind Akradhii — a digital growth studio and internship platform based in Hyderabad.",
  keywords: [
    "about akradhii",
    "digital growth studio hyderabad",
    "internship program india",
    "digital agency hyderabad",
  ],
  openGraph: {
    title: "About Us",
    description: "Story, mission and values of Akradhii Digital Growth Studio.",
    url: `${siteConfig.url}/about`,
    images: [
      {
        url: `${siteConfig.url}/og-default.svg`,
        width: 1200,
        height: 630,
        alt: "About Akradhii",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${siteConfig.url}/og-default.svg`],
  },
  alternates: { canonical: `${siteConfig.url}/about` },
};

const values = [
  { icon: Lightbulb, title: "Innovation", text: "We adopt modern tools and methods when they solve real problems — not for trend-chasing." },
  { icon: Shield, title: "Transparency", text: "Clear scope, honest timelines and reporting you can take to your leadership team." },
  { icon: Target, title: "Quality", text: "Craft in design, code and campaigns. We ship work we would put our name on." },
  { icon: HeartHandshake, title: "Client focus", text: "We operate like partners: invested in outcomes, not just tickets closed." },
  { icon: Sparkles, title: "Continuous learning", text: "Our internship arm keeps the team sharp and creates paths for new talent." },
  { icon: Rocket, title: "Reliability", text: "Milestones, communication and support you can plan around." },
];

const differentiators = [
  {
    title: "Delivery + talent under one roof",
    text: "Client work and structured internships share the same standards — real projects, real feedback, verifiable certificates.",
  },
  {
    title: "Full-funnel thinking",
    text: "Website, ads, CRM and automation are designed to work together instead of as disconnected vendor silos.",
  },
  {
    title: "Practical process",
    text: "Discovery, milestones and demos keep stakeholders aligned without drowning them in process theatre.",
  },
];

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

const publishedPosts = blogPosts
  .filter((post) => post.published)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" className="mb-4">
              <Building2 className="h-3 w-3" /> About us
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              A digital growth studio — and more
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Akradhii is a digital growth studio in {siteConfig.city}. We help businesses ship technology that converts, and we train students through structured, project-based internships.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="gradient" size="lg">
                <Link href="/contact" className="flex items-center gap-2">
                  Work with us <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/services">Explore services</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight">Our story</h2>
            <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Akradhii started with a simple observation: growing companies needed reliable digital partners, while ambitious students needed real project experience — not slide decks alone.
              </p>
              <p>
                We built a studio that does both. On the client side we design websites, run Meta campaigns, implement CRM and automation, and shape brands. On the education side we run internship tracks with modules, weekly work, assessments and QR-verifiable certificates.
              </p>
              <p>
                Today we operate from {siteConfig.address}, working with startups, SMBs and teams who want clarity, craft and measurable progress.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-6">
                <Compass className="h-8 w-8 text-brand-400" />
                <h3 className="mt-4 text-lg font-bold">Mission</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Help ambitious businesses grow with integrated digital systems — and close the skills gap by training professionals on real work.
                </p>
              </Card>
              <Card className="p-6">
                <Eye className="h-8 w-8 text-brand-400" />
                <h3 className="mt-4 text-lg font-bold">Vision</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Become the default growth partner for modern brands in India — known for craft, transparency and career-defining internships.
                </p>
              </Card>
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
            <h2 className="text-3xl font-bold tracking-tight">Our approach</h2>
            <p className="mt-3 text-muted-foreground">How we turn goals into measurable outcomes.</p>
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Values we work by</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.04}>
              <Card className="h-full p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">What makes us different</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {differentiators.map((d, i) => (
              <Reveal key={d.title} delay={i * 0.05}>
                <Card className="h-full p-6">
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
            <div className="mt-3 flex flex-wrap gap-2">
              {partners.map((p) => (
                <span key={p} className="rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-brand-500/40 hover:text-foreground">
                  {p}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-400" />
              <h2 className="text-3xl font-bold">The team behind Akradhii</h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              A lean, hands-on team of full-stack engineers, performance marketers, product designers, and mentors — united by a shared commitment to craft and outcomes.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Full-stack engineers", text: "Building fast, accessible web experiences from prototype to production." },
              { label: "Performance marketers", text: "Driving qualified traffic and measurable ROI across paid and organic channels." },
              { label: "Product designers", text: "Shaping intuitive interfaces and cohesive brand systems." },
              { label: "Mentors & educators", text: "Guiding interns through real projects with structured feedback." },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 0.05}>
                <Card className="h-full p-6">
                  <p className="font-semibold">{c.label}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
              We keep the core team small and senior, scaling through specialists and structured interns as projects demand. Everyone ships; nobody is just a title.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Insights from the team</h2>
          <p className="mt-3 text-muted-foreground">
            Practical plays on growth, technology and the intern experience.
          </p>
        </Reveal>
        <div className="mt-10">
          <BlogListing posts={publishedPosts} />
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
                <Link href="/internships">Explore internships</Link>
              </Button>
            </div>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
