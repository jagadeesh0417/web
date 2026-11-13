import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { resources } from "@/lib/data/resources";
import { ResourceBrowser } from "@/components/marketing/resource-browser";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = { title: "Resources", description: "Practical guides and checklists for development, design, marketing, automation and careers.", alternates: { canonical: `${siteConfig.url}/resources` }, openGraph: { title: "Akradhii Resources", description: "Practical ideas for building, learning and growing.", url: `${siteConfig.url}/resources`, images: [`${siteConfig.url}/og-default.svg`] } };

export default function ResourcesPage() {
  return <main><section className="relative overflow-hidden border-b border-border"><div className="absolute inset-0 bg-grid opacity-40"/><div className="absolute inset-0 bg-glow"/><Reveal className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"><p className="text-sm font-semibold uppercase tracking-widest text-brand-500">The knowledge hub</p><h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">Ideas for building what&apos;s next.</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Practical guides and checklists for curious learners, creators and businesses. Start with a topic and put your knowledge to work.</p></Reveal></section><section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><Reveal><h2 className="mb-6 text-2xl font-bold">Explore the library</h2><ResourceBrowser items={resources}/></Reveal></section></main>;
}
