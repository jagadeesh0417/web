import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Target,
  Lightbulb,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { portfolioItems } from "@/lib/data/sample-data";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";

export const dynamicParams = true;

export function generateStaticParams() {
  return portfolioItems.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = portfolioItems.find((p) => p.slug === slug);
  if (!item) return { title: "Project not found" };
  return {
    title: `${item.title} Portfolio`,
    description: item.summary,
    openGraph: {
      title: item.title,
      description: item.summary,
      url: `${siteConfig.url}/portfolio/${item.slug}`,
      type: "article",
    },
    alternates: { canonical: `${siteConfig.url}/portfolio/${item.slug}` },
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = portfolioItems.find((p) => p.slug === slug);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <Button variant="ghost" size="sm" className="mb-6">
          <Link href="/portfolio" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>
        </Button>
      </Reveal>

      {/* Hero Banner */}
      <Reveal delay={0.1}>
        <div
          className={`relative flex h-72 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br ${item.gradient}`}
        >
          <span className="text-[10rem] font-black leading-none text-white/10 select-none">
            {item.title.charAt(0)}
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </Reveal>

      {/* Meta + Title + Summary */}
      <Reveal delay={0.15}>
        <div className="mt-10">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary">{item.service}</Badge>
            <span className="text-sm text-muted-foreground">
              Client: {item.client}
            </span>
            <span className="text-sm text-muted-foreground">
              &middot; {item.year}
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {item.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
        </div>
      </Reveal>

      {/* Challenge Section */}
      {item.challenge && (
        <Reveal delay={0.2}>
          <section className="mt-14">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <Target className="h-5 w-5 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold">The Challenge</h2>
            </div>
            <div className="mt-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <p className="text-base leading-relaxed text-muted-foreground">
                {item.challenge}
              </p>
            </div>
          </section>
        </Reveal>
      )}

      {/* Solution / Approach Section */}
      {item.solution && (
        <Reveal delay={0.25}>
          <section className="mt-14">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <Lightbulb className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold">Our Approach</h2>
            </div>
            <div className="mt-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <p className="text-base leading-relaxed text-muted-foreground">
                {item.solution}
              </p>
            </div>
          </section>
        </Reveal>
      )}

      {/* Results Cards */}
      <Reveal delay={0.3}>
        <section className="mt-14">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold">Results</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {item.results.map((r) => (
              <Card key={r.label} className="p-6 text-center">
                <p className="text-3xl font-extrabold text-gradient">
                  {r.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{r.label}</p>
              </Card>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Key Features Section */}
      {item.features && item.features.length > 0 && (
        <Reveal delay={0.35}>
          <section className="mt-14">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                <CheckCircle2 className="h-5 w-5 text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold">Key Features</h2>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {item.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* Tags */}
      <Reveal delay={0.4}>
        <div className="mt-12 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal delay={0.45}>
        <div className="mt-14 rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold">Want results like this?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Let&apos;s talk about your project.
          </p>
          <Button variant="gradient" className="mt-6">
            <Link
              href="/contact"
              className="flex items-center gap-2"
            >
              Start a project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </div>
  );
}
