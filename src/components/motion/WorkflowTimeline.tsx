"use client";

import type { CSSProperties, ReactNode } from "react";
import { useActiveStep } from "@/lib/motion/use-active-step";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { Reveal } from "./Reveal";
import styles from "./motion.module.css";

export interface WorkflowStep {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

export interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  className?: string;
  style?: CSSProperties;
  /** Horizontal layout. Default false (vertical rail). */
  horizontal?: boolean;
}

/**
 * Vertical workflow timeline with scroll-driven progression.
 * Uses IntersectionObserver (via useActiveStep) - no scroll listeners.
 */
export function WorkflowTimeline({ steps, className, style, horizontal }: WorkflowTimelineProps) {
  const reduced = useReducedMotion();
  const { setStepRef, activeIndex } = useActiveStep(steps.length, { disabled: reduced });
  const progress = steps.length > 1 ? Math.min(1, activeIndex / (steps.length - 1)) : 1;

  if (horizontal) {
    return (
      <div className={className} style={style}>
        <div className="relative grid gap-6 md:grid-cols-[repeat(var(--cols),minmax(0,1fr))]">
          <div className="absolute left-0 right-0 top-[0.55rem] h-[2px] bg-[var(--border)]" aria-hidden="true" />
          <div
            className="absolute left-0 top-[0.55rem] h-[2px] origin-left bg-gradient-to-r from-[#F4BD53] to-[#F58216]"
            style={{
              width: "100%",
              transform: `scaleX(${reduced ? 1 : progress})`,
              transition: reduced ? "none" : "transform 400ms cubic-bezier(0.2, 0, 0.2, 1)",
            }}
            aria-hidden="true"
          />
          {steps.map((step, i) => (
            <div key={i} ref={setStepRef(i) as never} className={styles["m-timelineStep"]}>
              <span
                className="block h-[1.1rem] w-[1.1rem] rounded-full border-2 bg-[var(--card)]"
                style={{ borderColor: i <= activeIndex || reduced ? "#D6A24A" : "var(--border)" }}
              />
              <Reveal as="h3" variant="heading" className="mt-3 text-lg font-semibold">
                {step.title}
              </Reveal>
              {step.description && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{step.description}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={[styles["m-timelineTrack"], className].filter(Boolean).join(" ")} style={style}>
      {/* progress rail */}
      <div className="absolute left-[0.75rem] top-2 bottom-2 w-[2px] bg-[var(--border)]" aria-hidden="true">
        <div
          className="h-full w-full origin-top bg-gradient-to-b from-[#F4BD53] to-[#F58216]"
          style={{
            transform: `scaleY(${reduced ? 1 : progress})`,
            transition: reduced ? "none" : "transform 400ms cubic-bezier(0.2, 0, 0.2, 1)",
          }}
        />
      </div>

      <div className="relative flex flex-col gap-8 pl-9">
        {steps.map((step, i) => {
          const isActive = reduced ? true : i <= activeIndex;
          return (
            <div
              key={i}
              ref={setStepRef(i) as never}
              className={[
                styles["m-timelineStep"],
                isActive ? styles["m-timelineStepActive"] : styles["m-timelineStepInactive"],
                "relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-5",
              ]
                .filter(Boolean)
                .join(" ")}
              data-active={isActive}
              aria-current={i === activeIndex ? "step" : undefined}
            >
              <span
                className="absolute -left-[2.15rem] top-5 h-[1.3rem] w-[1.3rem] rounded-full border-2 bg-[var(--card)] grid place-items-center"
                style={{ borderColor: isActive ? "#D6A24A" : "var(--border)" }}
                aria-hidden="true"
              >
                {step.icon ?? <span className="text-[0.7rem] font-semibold">{i + 1}</span>}
              </span>
              <Reveal variant="up">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">{step.title}</h3>
                {step.description && (
                  <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">{step.description}</p>
                )}
              </Reveal>
            </div>
          );
        })}
      </div>
    </div>
  );
}