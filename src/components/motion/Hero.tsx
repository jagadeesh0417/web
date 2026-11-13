"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { computeRevealDelay } from "@/lib/motion/helpers";
import { heroSequence } from "@/lib/motion/tokens";
import styles from "./motion.module.css";

export interface HeroItemProps {
  children: ReactNode;
  /** Which step in the entrance sequence this element belongs to. */
  step?: keyof typeof heroSequence;
  /** Additional delay in ms on top of the step delay. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export function HeroItem({ children, step = "title", delay = 0, className, style }: HeroItemProps) {
  const reduced = useReducedMotion();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (reduced) {
      setEntered(true);
      return;
    }
    // Trigger the transition one frame after mount so the browser registers the start value.
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const stepDelay = computeRevealDelay(reduced, (heroSequence[step] ?? 0) + delay);

  return (
    <div
      className={[styles["m-heroItem"], entered ? styles["m-heroItemVisible"] : "", className]
        .filter(Boolean)
        .join(" ")}
      data-motion-state={entered ? "visible" : "hidden"}
      style={{ transitionDelay: `${stepDelay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

export interface FloatingDecorProps {
  /** Decorative content (icon, blurred blob, etc.). */
  children?: ReactNode;
  /** Float animation duration in seconds. */
  duration?: number;
  /** Delay before the float starts, seconds. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

/** Subtle floating wrapper for decorative hero elements. */
export function FloatingDecor({ children, duration = 6, delay = 0, className, style }: FloatingDecorProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={className} style={style}>{children}</div>;
  }
  return (
    <div
      className={[styles["m-float"], className].filter(Boolean).join(" ")}
      style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s`, ...style }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

export interface HeroLightProps {
  className?: string;
  style?: CSSProperties;
}

/** Gentle drifting background light. Purely decorative, pointer-events disabled in CSS. */
export function HeroLight({ className, style }: HeroLightProps) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div
      className={[styles["m-heroLight"], className].filter(Boolean).join(" ")}
      style={style}
      aria-hidden="true"
    />
  );
}