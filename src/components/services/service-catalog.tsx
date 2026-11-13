"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { ServiceIcon } from "@/components/services/service-icons";

type Service = { id: string; title: string; description: string; keyBenefit: string; icon: string; features: string[] };

const categoryByService: Record<string, string> = {
  "web-development": "Website & Software",
  "meta-ads": "Marketing & Growth",
  seo: "Marketing & Growth",
  automation: "AI & Automation",
  crm: "AI & Automation",
  "ai-automation": "AI & Automation",
  branding: "Branding & Creative",
};
const categories = ["All services", "Website & Software", "Marketing & Growth", "AI & Automation", "Branding & Creative"];

export function ServiceCatalog({ services }: { services: Service[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return services.filter((service) =>
      (category === "All services" || categoryByService[service.id] === category) &&
      [service.title, service.description, ...service.features].some((text) => text.toLowerCase().includes(search)),
    );
  }, [category, query, services]);

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2" aria-label="Filter services by category">
          {categories.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`min-h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${category === item ? "border-amber-500 bg-amber-500/15 text-amber-300" : "border-border bg-card text-muted-foreground hover:border-amber-500/50 hover:text-foreground"}`}>
              {item}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Search services</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services" className="h-11 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-2 focus:outline-amber-400" />
        </label>
      </div>
      <p className="mt-6 text-sm text-muted-foreground" role="status">{filtered.length} {filtered.length === 1 ? "service" : "services"}</p>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((service) => (
          <article key={service.id} className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition duration-200 hover:-translate-y-1 hover:border-amber-500/60 hover:shadow-xl hover:shadow-orange-900/20 motion-reduce:transform-none motion-reduce:transition-none">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-400"><ServiceIcon name={service.icon} className="h-6 w-6" /></span>
              <span className="text-xs font-medium uppercase tracking-wider text-amber-400">{categoryByService[service.id]}</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold">{service.title}</h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{service.description}</p>
            <ul className="mt-5 flex flex-wrap gap-2">{service.features.slice(0, 3).map((feature) => <li key={feature} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{feature}</li>)}</ul>
            <p className="mt-5 border-t border-border pt-4 text-sm text-amber-300">{service.keyBenefit}</p>
            <Link href={`/services/${service.id}`} className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-foreground hover:text-amber-400 focus-visible:outline-2 focus-visible:outline-amber-400">Explore service <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transform-none" /></Link>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <p className="mt-8 rounded-xl border border-border bg-card p-6 text-muted-foreground">No services match your search. Try another term or category.</p>}
    </div>
  );
}
