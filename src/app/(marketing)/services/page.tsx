import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Blocks, Compass, Layers3, ShieldCheck } from "lucide-react";
import { servicesHub } from "@/config/services-detail";
import { siteConfig } from "@/config/site";
import { Reveal } from "@/components/marketing/reveal";
import { ServiceCatalog } from "@/components/services/service-catalog";
import { ServiceEnquiryForm } from "@/components/services/service-enquiry-form";

export const metadata: Metadata = {
  title: "Digital Agency Services",
  description: "Explore Akradhii's website development, Meta Ads, business automation, CRM, AI automation, SEO and branding services.",
  alternates: { canonical: `${siteConfig.url}/services` },
};

const approach = [
  { icon: Compass, title: "A clear direction", description: "Start with your goals, audience and constraints before choosing a solution." },
  { icon: Layers3, title: "Built around your business", description: "Shape scope and integrations around the way your team works." },
  { icon: Blocks, title: "Room to grow", description: "Plan the foundations, handoff and next steps with future changes in mind." },
  { icon: ShieldCheck, title: "Support beyond launch", description: "Discuss maintenance, updates and ongoing support as part of your engagement." },
];
const process = ["Discovery", "Strategy", "Design", "Development", "Testing", "Launch", "Optimization"];
const industries = ["E-commerce", "Education", "Healthcare", "Travel", "Hospitality", "Real estate", "Professional services", "Startups"];
const questions = [
  { q: "Can I combine services?", a: "Yes. Tell us what you are trying to achieve and we can discuss a scope that combines the relevant disciplines." },
  { q: "How is a project scoped?", a: "We start by discussing your objectives, existing systems and priorities, then outline the proposed deliverables and milestones before work begins." },
  { q: "Can you work with our existing tools?", a: "We can review your current website, CRM or marketing tools and discuss the integrations appropriate for your project." },
  { q: "Is ongoing support available?", a: "Support requirements vary by project. We can discuss maintenance and ongoing work as part of your proposal." },
];

export default function ServicesHubPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#090a0d] via-[#17120f] to-[#090a0d]">
        <div className="absolute inset-0 bg-grid opacity-20" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-amber-400">Strategy · Design · Technology · Growth</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Digital services built around <span className="text-gradient">your next stage of growth.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">From a stronger digital presence to more connected operations, explore the disciplines that can help your business move forward.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#catalog" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 font-semibold text-black transition hover:brightness-110">Explore services <ArrowRight className="h-4 w-4" /></a>
              <a href="#consultation" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-amber-500/50 px-6 font-semibold transition hover:bg-amber-500/10">Request consultation</a>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute inset-4 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="relative rounded-3xl border border-amber-500/25 bg-[#18191f]/95 p-6 shadow-2xl shadow-black/40 sm:p-8">
              <p className="text-xs uppercase tracking-[.2em] text-amber-400">A connected approach</p>
              <div className="mt-6 space-y-3">{["Build your digital presence", "Connect your tools and workflows", "Reach and engage your audience"].map((text, i) => <div key={text} className="flex items-center gap-4 rounded-xl border border-border bg-[#111216] p-4"><span className="text-sm font-semibold text-amber-400">0{i + 1}</span><span className="text-sm font-medium">{text}</span></div>)}</div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-400">What we do</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Find the right expertise</h2><p className="mt-4 text-muted-foreground">Browse our existing service areas, compare capabilities and explore the details of each engagement.</p></div>
        <ServiceCatalog services={servicesHub} />
      </section>

      <section className="border-y border-border bg-card/30"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><Reveal><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-400">Why Akradhii</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Thoughtful work, from first conversation to handoff.</h2></Reveal><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{approach.map(({ icon: Icon, title, description }) => <div key={title} className="rounded-2xl border border-border bg-card p-6"><Icon className="h-6 w-6 text-amber-400" /><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><Reveal><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-400">How we work</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">A clear path from idea to launch.</h2><p className="mt-4 max-w-2xl text-muted-foreground">The exact process depends on the engagement; these are the stages we can shape together.</p></Reveal><ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{process.map((step, i) => <li key={step} className="rounded-xl border border-border bg-card/60 p-5"><span className="text-sm text-amber-400">0{i + 1}</span><h3 className="mt-3 font-semibold">{step}</h3></li>)}</ol></section>

      <section className="border-y border-border bg-card/30"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><h2 className="text-3xl font-bold">Who we can work with</h2><p className="mt-4 text-muted-foreground">Our services may be relevant to teams across these target industries.</p><ul className="mt-8 flex flex-wrap gap-3">{industries.map((industry) => <li key={industry} className="rounded-full border border-border bg-card px-4 py-2 text-sm">{industry}</li>)}</ul></div></section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><div className="grid gap-10 lg:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-400">Questions</p><h2 className="mt-3 text-3xl font-bold">Planning your project?</h2><p className="mt-4 text-muted-foreground">Start with a few common questions, or tell us what you need.</p><Link href="/contact" className="mt-6 inline-flex items-center gap-2 font-semibold text-amber-400 hover:text-amber-300">Contact our team <ArrowRight className="h-4 w-4" /></Link></div><div className="space-y-3">{questions.map(({ q, a }) => <details key={q} className="group rounded-xl border border-border bg-card p-5"><summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-amber-400">{q}</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{a}</p></details>)}</div></div></section>

      <section id="consultation" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-20 sm:px-6 lg:px-8"><div className="grid gap-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#18191f] via-[#17120f] to-[#111216] p-6 sm:p-10 lg:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-400">Start a conversation</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">Tell us what you want to build.</h2><p className="mt-4 max-w-md text-muted-foreground">Share your goals and we can discuss the services and scope that fit your project.</p><p className="mt-6 text-sm text-muted-foreground"><a className="hover:text-amber-400" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a><br /><a className="hover:text-amber-400" href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>{siteConfig.phone}</a></p></div><ServiceEnquiryForm serviceTitle="General services" serviceSlug="" /></div></section>
    </div>
  );
}
