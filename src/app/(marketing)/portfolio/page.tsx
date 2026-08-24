import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { portfolioItems } from "@/lib/data/sample-data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";

export const metadata = {
  title: "Our Work",
  description: "A selection of Akradhii projects — websites, ad campaigns, automations and brands with measurable results.",
};

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge variant="primary" className="mb-4">Our work</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Work that moves numbers</h1>
        <p className="mt-4 text-muted-foreground">
          Every project ships with a measurable outcome. Here&apos;s a snapshot.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {portfolioItems.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <Link href={`/portfolio/${p.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/10">
                <div className={`relative flex h-52 items-center justify-center bg-gradient-to-br ${p.gradient}`}>
                  <span className="text-7xl font-black text-white/20 transition-transform duration-300 group-hover:scale-125">
                    A
                  </span>
                  <ArrowUpRight className="absolute right-5 top-5 h-6 w-6 text-white/70 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary">{p.service}</Badge>
                    <span className="text-xs text-muted-foreground">{p.year}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-bold">{p.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
                  <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
                    {p.results.map((r) => (
                      <div key={r.label}>
                        <p className="text-lg font-extrabold text-gradient">{r.value}</p>
                        <p className="text-[11px] text-muted-foreground">{r.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <Badge key={t} variant="outline">{t}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
