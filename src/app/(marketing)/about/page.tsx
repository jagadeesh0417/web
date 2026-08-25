import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Eye,
  HeartHandshake,
  Lightbulb,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "About Us | Akradhii",
  description:
    "The story, mission, vision and values behind Akradhii — a digital growth studio and internship platform based in Hyderabad.",
  openGraph: {
    title: "About Us | Akradhii",
    description: "Story, mission and values of Akradhii Digital Growth Studio.",
    url: `${siteConfig.url}/about`,
  },
  alternates: { canonical: `${siteConfig.url}/about` },
};

const values = [
  { icon: Lightbulb, title: "Innovation", text: "We adopt modern tools and methods when they solve real problems — not for trend-chasing." },
  { icon: Shield, title: "Transparency", text: "Clear scope, honest timelines and reporting you can take to your leadership team." },
  { icon: Target, title: "Quality", text: "Craft in design, code and campaigns. We ship work we would put our name on." },
  { icon: HeartHandshake, title: "Client focus", text: "We operate like partners: invested in outcomes, not just tickets closed." },
  { icon: Sparkles, title: "Continuous learning", text: "Our internship arm keeps the team sharp and creates paths for new talent." },
  { icon: Rocket, title: "Reliability", text: "Milestones, communication and support you can plan around." },
];

const differentiators = [
  {
    title: "Delivery + talent under one roof",
    text: "Client work and structured internships share the same standards — real projects, real feedback, verifiable certificates.",
  },
  {
    title: "Full-funnel thinking",
    text: "Website, ads, CRM and automation are designed to work together instead of as disconnected vendor silos.",
  },
  {
    title: "Practical process",
    text: "Discovery, milestones and demos keep stakeholders aligned without drowning them in process theatre.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" className="mb-4">About us</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Built to grow brands — and people
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Akradhii is a digital growth studio in {siteConfig.city}. We help businesses ship technology that converts, and we train students through structured, project-based internships.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight">Our story</h2>
            <div className="mt-5 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Akradhii started with a simple observation: growing companies needed reliable digital partners, while ambitious students needed real project experience — not slide decks alone.
              </p>
              <p>
                We built a studio that does both. On the client side we design websites, run Meta campaigns, implement CRM and automation, and shape brands. On the education side we run internship tracks with modules, weekly work, assessments and QR-verifiable certificates.
              </p>
              <p>
                Today we operate from {siteConfig.address}, working with startups, SMBs and teams who want clarity, craft and measurable progress.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-6">
                <Compass className="h-8 w-8 text-brand-400" />
                <h3 className="mt-4 text-lg font-bold">Mission</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Help ambitious businesses grow with integrated digital systems — and close the skills gap by training professionals on real work.
                </p>
              </Card>
              <Card className="p-6">
                <Eye className="h-8 w-8 text-brand-400" />
                <h3 className="mt-4 text-lg font-bold">Vision</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Become the default growth partner for modern brands in India — known for craft, transparency and career-defining internships.
                </p>
              </Card>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <h2 className="text-3xl font-bold">Values we work by</h2>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.04}>
                <Card className="h-full p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">What makes us different</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {differentiators.map((d, i) => (
            <Reveal key={d.title} delay={i * 0.05}>
              <Card className="h-full p-6">
                <h3 className="font-semibold">{d.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-400" />
              <h2 className="text-3xl font-bold">Leadership</h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              The people who set the bar for client delivery and mentorship. Bios reflect roles used across the platform.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Arjun Reddy", role: "Founder & CEO", bio: "Product engineering and digital growth. Sets studio direction across client work and internships." },
              { name: "Teja Verma", role: "Head of Delivery", bio: "Owns client delivery quality, timelines and account health across engagements." },
              { name: "Sneha Kulkarni", role: "Engineering & Mentorship Lead", bio: "Senior web engineer and lead mentor for the web development internship track." },
            ].map((m, i) => (
              <Reveal key={m.name} delay={i * 0.05}>
                <Card className="flex h-full gap-4 p-6">
                  <Avatar name={m.name} className="h-14 w-14 shrink-0 text-sm" />
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-brand-400">{m.role}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{m.bio}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <Card className="flex flex-col items-center gap-6 bg-gradient-to-br from-violet-700 to-indigo-700 p-10 text-center text-white sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="text-2xl font-bold">Want to work with Akradhii?</h2>
              <p className="mt-2 max-w-lg text-white/85">Start a project conversation or explore how our internship programs work.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button size="lg" className="bg-white text-violet-800 hover:bg-white/90">
                <Link href="/contact" className="flex items-center gap-2">Contact <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
                <Link href="/company">Company overview</Link>
              </Button>
            </div>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
