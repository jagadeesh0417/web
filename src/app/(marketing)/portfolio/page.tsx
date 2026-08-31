import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { portfolioItems } from "@/lib/data/sample-data";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";

const stats = [
  { value: "120+", label: "Projects Delivered" },
  { value: "30+", label: "Industries" },
  { value: "7", label: "Service Areas" },
];

export const metadata: Metadata = {
  title: "Our Work | Akradhii",
  description:
    "A look at what we've built — websites, Meta campaigns, automations and brand systems from the Akradhii studio.",
  openGraph: {
    title: "Our Work | Akradhii",
    description: "Selected Akradhii projects and case studies.",
    url: `${siteConfig.url}/portfolio`,
  },
  alternates: { canonical: `${siteConfig.url}/portfolio` },
};

export default function PortfolioPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" className="mb-4">
              <Briefcase className="h-3 w-3" /> Our work
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              A look at what we&apos;ve built
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Selected engagements across web, ads, automation and branding. Open a project for challenge, approach and outcomes.
            </p>
            <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-6 text-center">
              {stats.map((s) => (
                <Reveal key={s.label} delay={0.15}>
                  <div>
                    <p className="text-3xl font-extrabold tracking-tight text-brand-400">{s.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <PortfolioGrid items={[...portfolioItems]} />

        <Reveal className="mt-16">
          <Card className="flex flex-col items-center justify-between gap-4 bg-card p-8 text-center sm:flex-row sm:text-left">
            <div>
              <h2 className="text-xl font-bold">Have a similar project?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tell us your goals — we&apos;ll map the right services.</p>
            </div>
            <Button variant="gradient">
              <Link href="/contact" className="flex items-center gap-2">
                Start a project <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
