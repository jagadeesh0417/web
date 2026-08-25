"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PortfolioItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.service));
    return ["All", ...Array.from(set)];
  }, [items]);

  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? items : items.filter((i) => i.service === filter);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              filter === c
                ? "border-brand-500 bg-brand-600/15 text-brand-300"
                : "border-border text-muted-foreground hover:border-brand-500/40",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">No projects in this category yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {filtered.map((p) => (
            <Link key={p.id} href={`/portfolio/${p.slug}`}>
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
          ))}
        </div>
      )}
    </div>
  );
}
