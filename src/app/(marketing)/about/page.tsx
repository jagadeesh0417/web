import Link from "next/link";
import { Target, Rocket, HeartHandshake, ArrowRight } from "lucide-react";
import { stats } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";

export const metadata = {
  title: "About",
  description: "Akradhii is a premium digital growth studio — and a school for the next generation of digital professionals.",
};

const values = [
  {
    icon: Target,
    title: "Outcomes over output",
    text: "We measure success in revenue, leads and careers — not hours billed.",
  },
  {
    icon: Rocket,
    title: "Ship fast, then improve",
    text: "Momentum beats perfection. We launch, measure and iterate relentlessly.",
  },
  {
    icon: HeartHandshake,
    title: "Partners, not vendors",
    text: "We operate like an extension of your team — invested in your results.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-3xl text-center">
        <Badge variant="primary" className="mb-4">About Akradhii</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          A digital growth studio with a <span className="text-gradient">mission</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Akradhii exists to help ambitious businesses grow with technology — and to close the skills gap by
          training the next generation of digital professionals through real, structured internships.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-12 grid gap-5 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-6 text-center">
            <p className="text-3xl font-extrabold text-gradient">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </Reveal>

      <Reveal delay={0.15} className="mt-20">
        <h2 className="text-center text-3xl font-bold">What we stand for</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {values.map((v) => (
            <Card key={v.title} className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
            </Card>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1} className="mt-20 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">Two sides, one purpose</h2>
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-semibold">For businesses</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Websites that convert, ad campaigns that scale, automations that save thousands of hours, and
                brands people remember. We&apos;ve delivered 120+ projects across fintech, D2C, SaaS and local brands.
              </p>
            </div>
            <div className="rounded-2xl border border-brand-500/40 bg-brand-600/5 p-6">
              <h3 className="font-semibold">For students</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Our internship programs put students on real projects with real mentors. Graduates leave with a
                portfolio, verifiable certificates and performance reports that open doors. 300+ interns trained
                and counting.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-8">
          <h3 className="text-lg font-semibold">Leadership</h3>
          <div className="mt-6 space-y-6">
            {[
              { name: "Arjun Reddy", role: "Founder & CEO", bio: "12 years across product engineering and digital growth. Ex-CTO of two funded startups." },
              { name: "Teja Verma", role: "Head of Delivery", bio: "Runs client delivery with a 98% satisfaction score across all accounts." },
              { name: "Sneha Kulkarni", role: "Engineering & Mentorship Lead", bio: "Senior web engineer and lead mentor for our web development track." },
            ].map((m) => (
              <div key={m.name} className="flex items-start gap-4">
                <Avatar name={m.name} className="h-12 w-12 text-sm" />
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-brand-500">{m.role}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-20 text-center">
        <Button variant="gradient" size="lg">
          <Link href="/contact" className="flex items-center gap-2">Work with us <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </Reveal>
    </div>
  );
}
