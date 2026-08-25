import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { portfolioItems } from "@/lib/data/sample-data";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";

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
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge variant="primary" className="mb-4">Our work</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">A look at what we&apos;ve built</h1>
        <p className="mt-4 text-muted-foreground">
          Selected engagements across web, ads, automation and branding. Open a project for challenge, approach and outcomes.
        </p>
      </Reveal>

      <div className="mt-12">
        <PortfolioGrid items={[...portfolioItems]} />
      </div>

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
  );
}
