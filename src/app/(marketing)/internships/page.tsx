import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Lock,
  PlayCircle,
  Send,
  Unlock,
} from "lucide-react";
import { PROGRAMS, CATEGORIES } from "@/lib/constants";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Internships | Akradhii",
  description:
    "Build skills, ship projects and earn a verifiable certificate. 4, 6 and 8-week Akradhii internship programs across 10 tracks.",
  openGraph: {
    title: "Internships | Akradhii",
    description: "Structured internship programs with modules, projects, assessment and QR-verifiable certificates.",
    url: `${siteConfig.url}/internships`,
  },
  alternates: { canonical: `${siteConfig.url}/internships` },
};

const learningFlow = [
  { step: "01", title: "Choose program", text: "Pick a category track that matches your career goals.", icon: GraduationCap },
  { step: "02", title: "Choose duration", text: "Foundation (4), Professional (6) or Industry (8) weeks.", icon: BookOpen },
  { step: "03", title: "Enroll", text: "Complete the application and secure your seat with payment.", icon: Send },
  { step: "04", title: "Get access", text: "Activate your account and open the student dashboard.", icon: Unlock },
  { step: "05", title: "Learn", text: "Watch lessons, read notes and join live sessions where scheduled.", icon: PlayCircle },
  { step: "06", title: "Complete weekly tasks", text: "Build assignments and mini-projects each week.", icon: ClipboardCheck },
  { step: "07", title: "Submit work", text: "Share Drive, GitHub, Figma or Canva links for mentor review.", icon: Send },
  { step: "08", title: "Unlock next module", text: "Finish lessons and get assignments approved to progress.", icon: Lock },
  { step: "09", title: "Final assessment", text: "Pass the assessment (70%+, limited attempts) when eligible.", icon: ClipboardCheck },
  { step: "10", title: "Certificate", text: "Receive a QR-verifiable certificate of completion.", icon: Award },
];

export default function InternshipsPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" className="mb-4">
              <GraduationCap className="h-3 w-3" /> Internships at Akradhii
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Build skills. Work on projects.{" "}
              <span className="text-gradient">Launch your career.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Structured programs with curriculum, weekly submissions, progressive unlocking, final assessment and a certificate employers can verify.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="gradient" size="lg">
                <a href="#programs" className="flex items-center gap-2">
                  Explore internships <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/internships/apply" className="flex items-center gap-2">Apply now</Link>
              </Button>
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
                  <Badge variant={p.featured ? "primary" : "default"}>{p.durationWeeks} weeks</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed">{p.description}</p>
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

      {/* Categories / programs */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Internship tracks</h2>
            <p className="mt-3 text-muted-foreground">
              Each track has its own curriculum, mentor focus and project style. Open a page for skills, FAQs and apply links.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.id} delay={i * 0.03}>
                <Link href={`/internships/${c.slug}`}>
                  <Card className="group h-full p-6 transition-all hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.gradient} text-white`}>
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-semibold">{c.name}</h3>
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Learning flow */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Learning journey</h2>
          <p className="mt-3 text-muted-foreground">
            From program selection to a verified certificate — aligned with the live student dashboard.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {learningFlow.map((f, i) => (
            <Reveal key={f.step} delay={i * 0.03}>
              <Card className="h-full p-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-brand-500/25">{f.step}</span>
                  <f.icon className="h-4 w-4 text-brand-400" />
                </div>
                <h3 className="mt-2 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">{f.text}</p>
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
                  "QR-verifiable certificate of completion",
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
                    <Link href="/verify-certificate">Verify a certificate</Link>
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
          {[
            { q: "Is the internship paid?", a: "It is a project-based learning internship. You invest in the program and receive mentorship, projects, a portfolio trail and a verifiable certificate." },
            { q: "How do modules unlock?", a: "Complete the week’s lessons and get that week’s assignment approved. The next module unlocks automatically in your dashboard." },
            { q: "How do I get the certificate?", a: "Finish required lessons, get assignments approved, pass the final assessment (70%+), then issue or download from the Certificate page. Anyone can verify it via QR or /verify-certificate." },
            { q: "Can I switch tracks?", a: "Talk to support early in the program. Switches depend on seat availability and progress." },
            { q: "Where do I apply?", a: "Use Apply now — the wizard captures profile details, program, duration and payment, then activates your student account." },
          ].map((f) => (
            <details key={f.q} className="group rounded-xl border border-border bg-card p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
                {f.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
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
