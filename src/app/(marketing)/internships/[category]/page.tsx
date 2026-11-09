import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, GraduationCap, ChevronDown } from "lucide-react";
import { CATEGORIES, CATEGORY_BY_SLUG, PROGRAMS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";

export async function generateStaticParams() {
  return Object.keys(CATEGORY_BY_SLUG).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = CATEGORY_BY_SLUG[slug as keyof typeof CATEGORY_BY_SLUG];
  if (!category) return { title: "Internship not found" };
  return {
      title: `${category.name} Internship`,
    description: `Join the ${category.name} internship at Akradhii. Learn ${category.skills.slice(0, 3).join(", ")} and more through project-based training.`,
    openGraph: {
      title: `${category.name} Internship`,
      description: `Project-based ${category.name} internship with mentorship, real projects and verifiable certificates.`,
      url: `${siteConfig.url}/internships/${slug}`,
      type: "article",
      images: [
        {
          url: `${siteConfig.url}/internships/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${category.name} Internship`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [`${siteConfig.url}/internships/${slug}/opengraph-image`],
    },
    alternates: { canonical: `${siteConfig.url}/internships/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = CATEGORY_BY_SLUG[slug as keyof typeof CATEGORY_BY_SLUG];
  if (!category) notFound();

  const url = `${siteConfig.url}/internships/${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Course", name: `${category.name} Internship`, description: category.description, provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url }, offers: PROGRAMS.map((p) => ({ "@type": "Offer", price: p.price, priceCurrency: "INR", url: `${siteConfig.url}/internships/apply?track=${slug}&program=${p.slug}` })) },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Internships", item: `${siteConfig.url}/internships` }, { "@type": "ListItem", position: 2, name: category.name, item: url }] },
      { "@type": "FAQPage", mainEntity: category.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <Button variant="ghost" size="sm" className="mb-6">
        <Link href="/internships" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> All programs
        </Link>
      </Button>

      <div className={`rounded-3xl bg-gradient-to-br ${category.gradient} p-8 text-white sm:p-12`}>
        <Badge className="border-white/30 bg-white/10 text-white">{category.name}</Badge>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">{category.name} Internship</h1>
        <p className="mt-4 max-w-2xl text-white/85">{category.description}</p>
        <form action="/internships/apply" method="get" className="mt-8">
          <input type="hidden" name="track" value={category.slug} />
          <fieldset>
            <legend className="text-sm font-semibold">Choose a plan</legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {PROGRAMS.map((p) => (
                <label key={p.slug} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/50 px-3 py-2 text-sm">
                  <input type="radio" name="program" value={p.slug} defaultChecked={p.featured} required />
                  {p.title} · {p.duration} · {formatCurrency(p.price)}{p.featured ? " · Most popular" : ""}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="mt-5 rounded-lg bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Apply now</button>
          <p className="mt-3 text-sm text-white/90">Certificate included · Mentor details confirmed for each batch</p>
        </form>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold">What you&apos;ll learn</h2>
          <ul className="mt-4 space-y-3">
            {category.learningOutcomes.map((o) => (
              <li key={o} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {o}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Skills you&apos;ll build</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {category.skills.map((s) => (
              <Badge key={s} variant="primary">{s}</Badge>
            ))}
          </div>
          <h2 className="mt-6 font-semibold">Prerequisites</h2>
          <ul className="mt-3 space-y-2">
            {category.prerequisites.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {p}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        <Card className="flex-1 p-6">
          <h2 className="font-semibold">Duration options</h2>
          <div className="mt-4 space-y-3">
            {PROGRAMS.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-semibold">{p.title}</p>
                  <p className="text-sm font-bold">{formatCurrency(p.price)}</p>
                  <p className="text-xs text-muted-foreground">{p.features.slice(0, 2).join(" · ")}…</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default">{p.duration}</Badge>
                  <Button variant="outline" size="sm">
                    <Link href={`/internships/apply?track=${category.slug}&program=${p.slug}`}>Choose</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">For refund details, read the <Link className="underline" href="/terms">terms</Link> or contact support.</p>
        </Card>

          <Card className="w-full p-6 lg:w-80">
            <h2 className="font-semibold">Mentor support</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Mentor details will be confirmed for your batch. Contact support for more information.
            </p>
          </Card>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Related tracks</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {CATEGORIES.filter((c) => c.slug !== slug).slice(0, 3).map((c) => <li key={c.slug}><Link className="block rounded-xl border border-border p-4 hover:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500" href={`/internships/${c.slug}`}>{c.name}</Link></li>)}
        </ul>
      </section>

      <div className="mx-auto mt-12 max-w-3xl">
        <h2 className="text-center text-2xl font-bold">FAQ</h2>
        <div className="mt-6 space-y-3">
          {category.faqs.map((f) => (
            <details key={f.question} className="group rounded-xl border border-border bg-card p-5">
              <summary className="flex cursor-pointer items-center justify-between font-medium list-none">
                {f.question}
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>

      <Reveal className="mt-14 text-center">
        <Button variant="gradient" size="lg">
          <Link href={`/internships/apply?track=${category.slug}&program=professional`}>Apply for {category.name}</Link>
        </Button>
      </Reveal>
    </div>
  );
}
