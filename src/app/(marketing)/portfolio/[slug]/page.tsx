import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { portfolioItems } from "@/lib/data/sample-data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamicParams = true;

export function generateStaticParams() {
  return portfolioItems.map((p) => ({ slug: p.slug }));
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = portfolioItems.find((p) => p.slug === slug);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6">
        <Link href="/portfolio" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>
      </Button>

      <div className={`flex h-64 items-center justify-center rounded-3xl bg-gradient-to-br ${item.gradient}`}>
        <span className="text-8xl font-black text-white/20">A</span>
      </div>

      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary">{item.service}</Badge>
          <span className="text-sm text-muted-foreground">Client: {item.client}</span>
          <span className="text-sm text-muted-foreground">· {item.year}</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">{item.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{item.summary}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {item.results.map((r) => (
          <Card key={r.label} className="p-6 text-center">
            <p className="text-3xl font-extrabold text-gradient">{r.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{r.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {item.tags.map((t) => (
          <Badge key={t} variant="outline">{t}</Badge>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="text-xl font-bold">Want results like this?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Let&apos;s talk about your project.</p>
        <Button variant="gradient" className="mt-5">
          <Link href="/contact" className="flex items-center gap-2">Start a project <ArrowUpRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
