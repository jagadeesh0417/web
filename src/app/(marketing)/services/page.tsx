import Link from "next/link";
import { Code2, Megaphone, Workflow, Database, BrainCircuit, Search, Palette, ArrowRight, CheckCircle2 } from "lucide-react";
import { services } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2, Megaphone, Workflow, Database, BrainCircuit, Search, Palette,
};

export const metadata = {
  title: "Services",
  description: "Website development, Meta Ads, automation, CRM, AI, SEO and branding — Akradhii's full service stack.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge variant="primary" className="mb-4">Our services</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Everything your brand needs to grow</h1>
        <p className="mt-4 text-muted-foreground">
          One team, seven disciplines. We plug into your business at any stage and scale from there.
        </p>
      </Reveal>

      <div className="mt-16 space-y-16">
        {services.map((s, i) => {
          const Icon = icons[s.icon as keyof typeof icons] ?? Code2;
          const flip = i % 2 === 1;
          return (
            <Reveal key={s.id}>
              <div id={s.id} className={`flex flex-col items-start gap-8 rounded-3xl border border-border bg-card p-8 lg:flex-row lg:items-center lg:p-12 ${flip ? "lg:flex-row-reverse" : ""}`}>
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xl shadow-violet-600/25">
                  <Icon className="h-9 w-9" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{s.title}</h2>
                  <p className="mt-2 max-w-xl text-muted-foreground">{s.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.features.map((f) => (
                      <span key={f} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="shrink-0">
                  <Link href="/contact" className="flex items-center gap-2">Get a quote <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-20 text-center">
        <Card className="bg-gradient-to-br from-violet-700 to-indigo-700 p-10 text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">Need a custom combination?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Most of our engagements bundle two or more services. Tell us your goals and we&apos;ll architect the stack.
          </p>
          <Button size="lg" className="mt-6 bg-white text-violet-700 hover:bg-white/90">
            <Link href="/contact" className="flex items-center gap-2">Start the conversation <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </Card>
      </Reveal>
    </div>
  );
}
