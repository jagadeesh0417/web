"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { useInView } from "@/lib/motion/use-in-view";
import { computeRevealDelay, computeRevealShow } from "@/lib/motion/helpers";
import styles from "./motion.module.css";

export type RevealVariant = "up" | "fade" | "scale" | "left" | "right" | "heading";

export interface RevealProps {
  children: ReactNode;
  /** Visual variant. Default "up". */
  variant?: RevealVariant;
  /** Delay in ms. Default 0. */
  delay?: number;
  /** Intersection threshold. Default 0.15. */
  threshold?: number;
  /** Animate only once. Default true. */
  once?: boolean;
  /** Root margin for IntersectionObserver. */
  rootMargin?: string;
  /** Rendered element. Default "div". */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

const variantClass: Record<RevealVariant, string> = {
  up: styles["m-reveal"],
  fade: styles["m-revealFadeIn"],
  scale: styles["m-revealScale"],
  left: styles["m-revealLeft"],
  right: styles["m-revealRight"],
  heading: styles["m-revealHeading"],
};

const visibleClass: Record<RevealVariant, string> = {
  up: styles["m-revealVisible"],
  fade: styles["m-revealFadeInVisible"],
  scale: styles["m-revealScaleVisible"],
  left: styles["m-revealLeftVisible"],
  right: styles["m-revealRightVisible"],
  heading: styles["m-revealHeadingVisible"],
};

export function Reveal({
  children,
  variant = "up",
  delay = 0,
  threshold = 0.15,
  once = true,
  rootMargin = "0px",
  as: Tag = "div",
  className,
  style,
}: RevealProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold, once, rootMargin, disabled: reduced });
  const show = computeRevealShow(reduced, inView);
  const revealDelay = computeRevealDelay(reduced, delay);

  return (
    <Tag
      ref={ref as never}
      className={[variantClass[variant], show ? visibleClass[variant] : "", className]
        .filter(Boolean)
        .join(" ")}
      data-motion-state={show ? "visible" : "hidden"}
      style={{ transitionDelay: `${revealDelay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}