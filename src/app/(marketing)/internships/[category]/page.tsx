import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, GraduationCap, ChevronDown } from "lucide-react";
import { CATEGORY_BY_SLUG, PROGRAMS } from "@/lib/constants";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Reveal } from "@/components/marketing/reveal";

const mentors = {
  m1: { name: "Sneha Kulkarni", role: "Senior Web Engineer" },
  m2: { name: "Rahul Iyer", role: "Design Lead" },
  m3: { name: "Priya Sharma", role: "Performance Marketer" },
  m4: { name: "Arjun Reddy", role: "Founder & Growth Strategist" },
  m5: { name: "Teja Verma", role: "Head of Delivery" },
} as const;

export async function generateStaticParams() {
  return Object.keys(CATEGORY_BY_SLUG).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
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
    },
    alternates: { canonical: `${siteConfig.url}/internships/${slug}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG[slug as keyof typeof CATEGORY_BY_SLUG];
  if (!category) notFound();

  const mentor = mentors[category.mentorId as keyof typeof mentors];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6">
        <Link href="/internships" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> All programs
        </Link>
      </Button>

      <div className={`rounded-3xl bg-gradient-to-br ${category.gradient} p-8 text-white sm:p-12`}>
        <Badge className="border-white/30 bg-white/10 text-white">{category.name}</Badge>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">{category.name} Internship</h1>
        <p className="mt-4 max-w-2xl text-white/85">{category.description}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button className="bg-white text-slate-900 hover:bg-white/90">
            <Link href={`/internships/apply?category=${category.slug}`}>Apply now</Link>
          </Button>
          <span className="text-sm text-white/75">Free to apply · Reviewed within 2-3 days</span>
        </div>
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
                  <p className="text-xs text-muted-foreground">{p.features.slice(0, 2).join(" · ")}…</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="default">{p.duration}</Badge>
                  <Button variant="outline" size="sm">
                    <Link href={`/internships/apply?category=${category.slug}&program=${p.slug}`}>Choose</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {mentor && (
          <Card className="w-full p-6 lg:w-80">
            <h2 className="font-semibold">Your mentor</h2>
            <div className="mt-4 flex items-center gap-3">
              <Avatar name={mentor.name} className="h-14 w-14 text-base" />
              <div>
                <p className="font-semibold">{mentor.name}</p>
                <p className="text-xs text-muted-foreground">{mentor.role}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Leads live sessions, reviews your assignments and gives you direct feedback throughout the program.
            </p>
          </Card>
        )}
      </div>

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
          <Link href={`/internships/apply?category=${category.slug}`}>Apply for {category.name}</Link>
        </Button>
      </Reveal>
    </div>
  );
}
