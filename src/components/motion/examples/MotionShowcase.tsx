"use client";

import { Code2, Layers, Rocket, Sparkles } from "lucide-react";
import { hoverCardIconClass } from "@/components/motion";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerContainer, StaggerItem } from "@/components/motion/Stagger";
import { HoverCard } from "@/components/motion/HoverCard";
import { MotionButton } from "@/components/motion/MotionButton";
import { HeroItem, FloatingDecor, HeroLight } from "@/components/motion/Hero";
import { WorkflowTimeline } from "@/components/motion/WorkflowTimeline";

/**
 * Reference showcase of the Akradhii premium motion system.
 *
 * This component is isolated demo code. Drop it on any page while building the
 * homepage, verify the motion, then remove it. It is safe to delete and does not
 * affect the layout or theme files.
 */
const features = [
  { icon: Layers, title: "Scroll reveal", body: "Headings and copy ease in as they enter the viewport." },
  { icon: Sparkles, title: "Hover glow", body: "Cards lift with a subtle gold glow and border highlight." },
  { icon: Rocket, title: "Hero entrance", body: "A timed, lightweight sequence on load." },
  { icon: Code2, title: "Reduced motion", body: "All effects collapse to instant for accessibility." },
];

export function MotionShowcase() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10">
        <HeroLight className="right-[-10%] top-[-20%] h-72 w-72 bg-[color-mix(in_srgb,#F58216_25%,transparent)]" />
        <FloatingDecor className="absolute right-10 top-10">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border-gold)] text-[var(--primary)]">
            <Sparkles className="h-5 w-5" />
          </span>
        </FloatingDecor>
        <HeroItem step="eyebrow">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--primary)]">Premium motion</p>
        </HeroItem>
        <HeroItem step="title">
          <h2 className="mt-2 text-3xl font-semibold">Cinematic by default, calm by choice</h2>
        </HeroItem>
        <HeroItem step="subtitle">
          <p className="mt-3 max-w-xl text-[var(--muted-foreground)]">
            Reusable, GPU-friendly animations for the new Akradhii homepage.
          </p>
        </HeroItem>
        <HeroItem step="cta" className="mt-6 flex gap-3">
          <MotionButton arrow>Get started</MotionButton>
          <MotionButton variant="ghost">Learn more</MotionButton>
        </HeroItem>
      </div>

      {/* Cards */}
      <Reveal as="h3" variant="heading" className="mt-16 text-2xl font-semibold">
        Capability cards
      </Reveal>
      <Reveal className="mt-2 text-sm text-[var(--muted-foreground)]">Staggered reveal + hover motion.</Reveal>
      <StaggerContainer className="mt-6 grid gap-5 sm:grid-cols-2">
        {features.map((feature, i) => (
          <StaggerItem key={feature.title} index={i}>
            <HoverCard className="h-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <feature.icon className={["h-6 w-6 text-[var(--primary)]", hoverCardIconClass].join(" ")} />
              <h4 className="mt-3 font-semibold">{feature.title}</h4>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{feature.body}</p>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Workflow */}
      <Reveal as="h3" variant="heading" className="mt-20 text-2xl font-semibold">
        How we work
      </Reveal>
      <WorkflowTimeline
        className="mt-8"
        steps={[
          { title: "Discover", description: "Understand goals, audience and constraints." },
          { title: "Design", description: "Wireframe, prototype and refine the visuals." },
          { title: "Build", description: "Develop with a performant, maintainable stack." },
          { title: "Launch", description: "Ship, measure, and iterate for results." },
        ]}
      />
    </section>
  );
}