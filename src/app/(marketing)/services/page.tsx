import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { servicesHub } from "@/config/services-detail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { ServiceIcon } from "@/components/services/service-icons";
import { PortfolioGrid } from "@/components/marketing/portfolio-grid";
import { portfolioItems } from "@/lib/data/sample-data";

export const metadata: Metadata = {
  title: "Services | Akradhii",
  description:
    "Explore Akradhii services — website development, Meta Ads, automation, CRM, AI, SEO and branding. Open a dedicated page for each offering.",
};

const stats = [
  { value: "120+", label: "Projects Delivered" },
  { value: "30+", label: "Industries" },
  { value: "7", label: "Service Areas" },
];

export default function ServicesHubPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" className="mb-4">Our services</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Everything your brand needs to grow
            </h1>
            <p className="mt-4 text-muted-foreground">
              One team, seven disciplines. Browse the overview below, then open a dedicated page for process, deliverables and a service-specific enquiry.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card/60 p-4">
                  <p className="text-2xl font-bold text-brand-400">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servicesHub.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.04}>
              <Card className="flex h-full flex-col p-6 transition-all hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-600/10">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-lg`}
                >
                  <ServiceIcon name={s.icon} className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-lg font-bold">{s.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.description}</p>
                <p className="mt-3 flex items-start gap-2 text-xs font-medium text-brand-300">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {s.keyBenefit}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {s.features.slice(0, 3).map((f) => (
                    <Badge key={f} variant="outline">{f}</Badge>
                  ))}
                </div>
                <Button variant="outline" className="mt-6 w-full">
                  <Link href={`/services/${s.id}`} className="flex w-full items-center justify-center gap-2">
                    Explore service <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Badge variant="primary" className="mb-4">Our work</Badge>
            <h2 className="text-3xl font-bold tracking-tight">A look at what we&apos;ve built</h2>
            <p className="mt-3 text-muted-foreground">
              Selected engagements across websites, campaigns, automations and brand systems.
            </p>
          </Reveal>
          <div className="mt-12">
            <PortfolioGrid items={portfolioItems} />
          </div>
          <Reveal className="mt-12 text-center">
            <Card className="bg-gradient-to-br from-violet-700 to-indigo-700 p-10 text-white">
              <h2 className="text-2xl font-bold">Have a similar project?</h2>
              <p className="mx-auto mt-3 max-w-xl text-white/80">
                We&apos;d love to understand your goals and map out how we can help.
              </p>
              <Button size="lg" className="mt-6 bg-white text-violet-700 hover:bg-white/90">
                <Link href="/contact" className="flex items-center gap-2">
                  Start a project <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <Card className="bg-gradient-to-br from-violet-700 to-indigo-700 p-10 text-white">
            <h2 className="text-2xl font-bold sm:text-3xl">Need a custom combination?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Most engagements bundle two or more services. Tell us your goals and we&apos;ll architect the stack.
            </p>
            <Button size="lg" className="mt-6 bg-white text-violet-700 hover:bg-white/90">
              <Link href="/contact" className="flex items-center gap-2">
                Start the conversation <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
