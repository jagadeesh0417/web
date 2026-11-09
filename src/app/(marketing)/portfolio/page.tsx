import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { publicPortfolio as portfolioItems } from "@/lib/data/public-portfolio";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "A look at what we've built — websites, Meta campaigns, automations and brand systems from the Akradhii studio.",
  openGraph: {
    title: "Our Work",
    description: "Selected Akradhii projects and case studies.",
    url: `${siteConfig.url}/portfolio`,
    images: [
      {
        url: `${siteConfig.url}/og-default.svg`,
        width: 1200,
        height: 630,
        alt: "Akradhii Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${siteConfig.url}/og-default.svg`],
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
              Thoughtful digital work, shared with client permission. Our case studies are being prepared for publication.
            </p>
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
