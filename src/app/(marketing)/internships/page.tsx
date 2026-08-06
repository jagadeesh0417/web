import Link from "next/link";
import { CheckCircle2, GraduationCap, ArrowRight, ChevronDown } from "lucide-react";
import { PROGRAMS, CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";

export const metadata = {
  title: "Internship Programs",
  description:
    "4-week Foundation, 6-week Professional and 8-week Industry internships across 10 tracks — web, design, ads, marketing, automation, AI, and more.",
};

const flow = [
  { step: "01", title: "Pick your track", text: "Choose a category and duration that fits your goals." },
  { step: "02", title: "Register & apply", text: "Create an account, complete your profile and upload your resume." },
  { step: "03", title: "Get approved", text: "Our team reviews your application within 2-3 working days." },
  { step: "04", title: "Start learning", text: "Dashboard access unlocks — live sessions, modules, assignments and mentorship." },
  { step: "05", title: "Earn your certificate", text: "Complete everything and get a verifiable certificate + performance report." },
];

export default function InternshipsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <Badge variant="primary" className="mb-4">
          <GraduationCap className="h-3 w-3" /> Internships at Akradhii
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Real projects. Real mentors. <span className="text-gradient">Verifiable results.</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose your duration, complete your profile, and get dashboard access after approval.
        </p>
      </Reveal>

      {/* Programs */}
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {PROGRAMS.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08}>
            <Card className={`relative flex h-full flex-col p-6 ${p.featured ? "border-brand-500/60 shadow-xl shadow-brand-600/10" : ""}`}>
              {p.featured && (
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white">
                  Most popular
                </span>
              )}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{p.title}</h2>
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
                  <p className="text-xl font-bold">₹{p.price.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">one-time, no hidden fees</p>
                </div>
                <Button variant={p.featured ? "gradient" : "outline"}>
                  <Link href={`/internships/apply?program=${p.slug}`}>Apply now</Link>
                </Button>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      {/* Categories */}
      <div className="mt-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose your category</h2>
          <p className="mt-3 text-muted-foreground">Each track has its own curriculum, mentor and live sessions.</p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.04}>
              <Link href={`/internships/${c.slug}`}>
                <Card className="group h-full p-6 transition-all hover:-translate-y-1 hover:border-brand-500/50 hover:shadow-xl">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.gradient} text-white`}>
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{c.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-500">
                    View details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mt-24 rounded-3xl border border-border bg-card p-8 sm:p-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">How the application works</h2>
          <p className="mt-3 text-muted-foreground">From landing page to dashboard access in five steps.</p>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {flow.map((f, i) => (
            <Reveal key={f.step} delay={i * 0.06}>
              <div className="relative">
                <span className="text-3xl font-black text-brand-600/20 dark:text-brand-400/20">{f.step}</span>
                <h3 className="mt-2 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-24 max-w-3xl mx-auto">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {[
            { q: "Is the internship paid?", a: "It's a project-based learning internship. You invest in the program and receive mentorship, real projects, a portfolio and a verifiable certificate." },
            { q: "Are sessions live or recorded?", a: "Sessions are live with mentors, and recordings stay available in your dashboard for revision." },
            { q: "What do I need to qualify?", a: "Fill the application with your details and resume. Our team reviews every application — usually within 2-3 working days." },
            { q: "Will I get a certificate?", a: "Yes, after completing all modules, submitting required assignments and passing the attendance threshold. Certificates are verifiable via QR code and public URL." },
            { q: "Can I switch categories mid-program?", a: "Yes, within the first week. Talk to your mentor and we'll handle the transition." },
          ].map((f) => (
            <details key={f.q} className="group rounded-xl border border-border bg-card p-5">
              <summary className="flex cursor-pointer items-center justify-between font-medium list-none">
                {f.q}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <Reveal className="mt-20 text-center">
        <Button variant="gradient" size="lg">
          <Link href="/internships/apply" className="flex items-center gap-2">
            Start your application <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Reveal>
    </div>
  );
}
