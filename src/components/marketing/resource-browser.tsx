"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { readingTime, type Resource } from "@/lib/data/resources";

export function ResourceBrowser({ items }: { items: Resource[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [type, setType] = useState("All");
  const filtered = items.filter((item) => (category === "All" || item.category === category) && (difficulty === "All" || item.difficulty === difficulty) && (type === "All" || item.type === type) && `${item.title} ${item.summary} ${item.category}`.toLowerCase().includes(query.toLowerCase().trim()));
  const selectClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground";
  return <div>
    <div className="grid gap-3 md:grid-cols-4">
      <label className="relative md:col-span-1"><span className="sr-only">Search resources</span><Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground"/><input className={`${selectClass} pl-10`} placeholder="Search resources" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
      <label><span className="sr-only">Category</span><select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}><option value="All">All categories</option>{Array.from(new Set(items.map((i) => i.category))).map((c) => <option key={c}>{c}</option>)}</select></label>
      <label><span className="sr-only">Difficulty</span><select className={selectClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="All">All levels</option>{Array.from(new Set(items.map((i) => i.difficulty))).map((d) => <option key={d}>{d}</option>)}</select></label>
      <label><span className="sr-only">Resource type</span><select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}><option value="All">All types</option>{Array.from(new Set(items.map((i) => i.type))).map((t) => <option key={t}>{t}</option>)}</select></label>
    </div>
    <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">{filtered.length} {filtered.length === 1 ? "resource" : "resources"}</p>
    <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((item) => <Link key={item.slug} href={`/resources/${item.slug}`} className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand-500/50 motion-reduce:transform-none"><div className="flex items-center justify-between gap-3 text-xs font-semibold text-brand-500"><span>{item.category}</span><ArrowUpRight className="h-4 w-4" /></div><h2 className="mt-5 text-xl font-bold group-hover:text-brand-500">{item.title}</h2><p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{item.summary}</p><p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">{item.type} · {item.difficulty} · {readingTime(item)} min read</p></Link>)}</div>
    {filtered.length === 0 && <p className="py-12 text-center text-muted-foreground">No resources match those filters. Try a different search.</p>}
  </div>;
}
