import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { readingTime, resources } from "@/lib/data/resources";

export function generateStaticParams() { return resources.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const item = resources.find((r) => r.slug === slug);
  if (!item) return { title: "Resource not found" };
  const url = `${siteConfig.url}/resources/${item.slug}`;
  return { title: item.title, description: item.summary, alternates: { canonical: url }, openGraph: { title: item.title, description: item.summary, url, type: "article", publishedTime: item.publishedAt, images: [`${siteConfig.url}/og-default.svg`] }, twitter: { card: "summary_large_image" } };
}
export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = resources.find((r) => r.slug === slug); if (!item) notFound();
  const url = `${siteConfig.url}/resources/${item.slug}`;
  const related = [...resources.filter((r) => r.slug !== slug && r.category === item.category), ...resources.filter((r) => r.category !== item.category)].slice(0, 3);
  const structured = [{ "@context": "https://schema.org", "@type": "Article", headline: item.title, description: item.summary, datePublished: item.publishedAt, author: { "@type": "Organization", name: "Akradhii" }, mainEntityOfPage: url }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url }, { "@type": "ListItem", position: 2, name: "Resources", item: `${siteConfig.url}/resources` }, { "@type": "ListItem", position: 3, name: item.title, item: url }] }];
  return <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }}/><nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link href="/">Home</Link> / <Link href="/resources">Resources</Link> / <span aria-current="page">{item.title}</span></nav><article className="mx-auto max-w-3xl"><header className="border-b border-border py-12"><p className="text-sm font-semibold text-brand-500">{item.category} · {item.type}</p><h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{item.title}</h1><p className="mt-5 text-lg leading-8 text-muted-foreground">{item.summary}</p><p className="mt-6 text-sm text-muted-foreground">{item.difficulty} · {readingTime(item)} min read · <time dateTime={item.publishedAt}>{new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date(item.publishedAt))}</time></p></header><div className="space-y-10 py-12">{item.sections.map((section) => <section key={section.heading}><h2 className="text-2xl font-bold">{section.heading}</h2>{section.paragraphs.map((p) => <p key={p} className="mt-4 text-base leading-8 text-muted-foreground">{p}</p>)}</section>)}</div><a className="text-sm font-semibold text-brand-500 hover:underline" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">Share on LinkedIn ↗</a></article><section className="mt-20 border-t border-border pt-10"><h2 className="text-2xl font-bold">Keep learning</h2><div className="mt-6 grid gap-4 sm:grid-cols-3">{related.map((r) => <Link key={r.slug} className="rounded-xl border border-border bg-card p-5 hover:border-brand-500" href={`/resources/${r.slug}`}><span className="text-xs text-brand-500">{r.category}</span><h3 className="mt-2 font-semibold">{r.title}</h3></Link>)}</div></section></main>;
}
