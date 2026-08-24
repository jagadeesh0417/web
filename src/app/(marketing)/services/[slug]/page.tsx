import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import {
  getAllServiceSlugs,
  getRelatedServices,
  getServiceBySlug,
} from "@/config/services-detail";
import { siteConfig } from "@/config/site";
import { portfolioItems } from "@/lib/data/sample-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { ServiceEnquiryForm } from "@/components/services/service-enquiry-form";
import { ServiceFaq } from "@/components/services/service-faq";
import { ServiceIcon } from "@/components/services/service-icons";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.seoTitle,
    description: service.seoDescription,
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      url: `${siteConfig.url}/services/${service.slug}`,
      siteName: siteConfig.name,
      type: "website",
    },
    alternates: {
      canonical: `${siteConfig.url}/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const related = getRelatedServices(service.slug);
  const projects = portfolioItems.filter((p) => p.service === service.portfolioService).slice(0, 3);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border/60 bg-card/30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-4 py-3 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/services" className="hover:text-foreground">Services</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-foreground">{service.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-[0.12]`} />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <Badge variant="primary" className="mb-4">
                <Sparkles className="h-3 w-3" /> {service.title}
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                {service.heroHeadline}
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                {service.heroDescription}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="gradient" size="lg" asChild={false}>
                  <a href="#enquiry" className="flex items-center gap-2">
                    Get a free consultation <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="lg">
                  <a href="#enquiry" className="flex items-center gap-2">Request a quote</a>
                </Button>
              </div>
              <p className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span>{service.keyBenefit}</span>
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div
                className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${service.gradient} p-1 shadow-2xl shadow-violet-900/20`}
              >
                <div className="rounded-[1.35rem] bg-card/95 p-8 sm:p-10">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${service.gradient} text-white shadow-lg`}
                  >
                    <ServiceIcon name={service.icon} className="h-8 w-8" />
                  </div>
                  <h2 className="mt-6 text-xl font-bold">{service.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{service.shortDescription}</p>
                  <ul className="mt-6 space-y-2.5">
                    {service.whatWeProvide.slice(0, 4).map((item) => (
                      <li key={item.title} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span>{item.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What this service is about</h2>
            <div className="mt-6 space-y-4 text-muted-foreground">
              {service.intro.map((p) => (
                <p key={p.slice(0, 40)} className="leading-relaxed">{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* What we provide */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-3">What we provide</Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Capabilities included in this engagement</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {service.whatWeProvide.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.03}>
              <Card className="h-full p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600/15 text-brand-400">
                  <CircleDot className="h-4 w-4" />
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Business benefits</h2>
            <p className="mt-3 text-muted-foreground">Outcomes teams care about — not just deliverable checklists.</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {service.benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.04}>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-semibold text-brand-300">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who for + Process */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="flex items-center gap-2 text-brand-400">
              <Users className="h-5 w-5" />
              <h2 className="text-2xl font-bold tracking-tight">Who this is for</h2>
            </div>
            <ul className="mt-6 space-y-3">
              {service.whoFor.map((w) => (
                <li key={w} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-foreground/90">{w}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="text-2xl font-bold tracking-tight">Our process</h2>
            <ol className="mt-6 space-y-4">
              {service.process.map((step) => (
                <li key={step.step} className="flex gap-4">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${service.gradient} text-xs font-bold text-white`}
                  >
                    {step.step}
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* Deliverables + Tech */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight">What you&apos;ll receive</h2>
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-1">
                {service.deliverables.map((d) => (
                  <li
                    key={d}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    {d}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="text-2xl font-bold tracking-tight">{service.techLabel}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Representative tools we use for this service — final stack is confirmed during discovery.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {service.technologies.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <h3 className="mt-10 text-lg font-bold">Why choose Akradhii</h3>
              <div className="mt-4 space-y-3">
                {service.whyUs.map((w) => (
                  <div key={w.title} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm font-semibold">{w.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{w.description}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Relevant work</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Selected projects related to {service.title.toLowerCase()}.
            </p>
          </div>
          <Link href="/portfolio" className="text-sm font-medium text-brand-400 hover:underline">
            View all work →
          </Link>
        </Reveal>

        {projects.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.05}>
                <Link href={`/portfolio/${p.slug}`}>
                  <Card className="group h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:border-brand-500/40">
                    <div className={`h-28 bg-gradient-to-br ${p.gradient}`} />
                    <div className="p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{p.service}</p>
                      <h3 className="mt-1 font-semibold group-hover:text-brand-300">{p.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.summary}</p>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="mt-8">
            <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
              Case studies for this service are being prepared.{" "}
              <Link href="/contact" className="font-medium text-brand-400 hover:underline">
                Ask us for relevant examples
              </Link>
              .
            </Card>
          </Reveal>
        )}
      </section>

      {/* FAQ */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Frequently asked questions</h2>
            <p className="mt-2 text-sm text-muted-foreground">Specific to {service.title}.</p>
          </Reveal>
          <Reveal delay={0.05} className="mt-8">
            <ServiceFaq items={service.faqs} />
          </Reveal>
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquiry" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <Badge variant="primary" className="mb-3">Enquiry</Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{service.ctaHeadline}</h2>
            <p className="mt-3 text-muted-foreground">{service.ctaBody}</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Response within 24 hours
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> No obligation consultation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Service pre-selected for you
              </li>
            </ul>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-3">
            <Card className="p-6 sm:p-8">
              <ServiceEnquiryForm serviceTitle={service.title} serviceSlug={service.slug} />
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight">You may also be interested in</h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r, i) => (
                <Reveal key={r.slug} delay={i * 0.04}>
                  <Link href={`/services/${r.slug}`}>
                    <Card className="group h-full p-5 transition-all hover:border-brand-500/40">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${r.gradient} text-white`}
                      >
                        <ServiceIcon name={r.icon} className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold group-hover:text-brand-300">{r.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.shortDescription}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-400">
                        Explore <ArrowRight className="h-3 w-3" />
                      </span>
                    </Card>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <Card className={`overflow-hidden border-0 bg-gradient-to-br ${service.gradient} p-8 text-white sm:p-12`}>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold sm:text-3xl">Ready to get started?</h2>
              <p className="mt-3 text-white/85">
                Book a free consultation or jump straight into a quote request for {service.title}.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="w-full bg-white text-violet-800 hover:bg-white/90 sm:w-auto">
                  <a href="#enquiry" className="flex items-center gap-2">
                    Get a free consultation <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/40 bg-transparent text-white hover:bg-white/10 sm:w-auto"
                >
                  <Link href="/contact" className="flex items-center gap-2">Talk to us</Link>
                </Button>
              </div>
            </div>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
