"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { useInView } from "@/lib/motion/use-in-view";
import { staggerStep } from "@/lib/motion/tokens";
import styles from "./motion.module.css";

export interface StaggerItemProps {
  children: ReactNode;
  /** Index among siblings, used for stagger delay. Default 0. */
  index?: number;
  /** Base stagger step in ms. Default from tokens (80). */
  step?: number;
  /** Extra delay in ms. Default 0. */
  delay?: number;
  threshold?: number;
  once?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

export function StaggerItem({
  children,
  index = 0,
  step = staggerStep,
  delay = 0,
  threshold = 0.15,
  once = true,
  as: Tag = "div",
  className,
  style,
}: StaggerItemProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold, once, disabled: reduced });
  const show = reduced || inView;
  const totalDelay = reduced ? 0 : delay + index * step;

  return (
    <Tag
      ref={ref as never}
      className={[styles["m-staggerItem"], show ? styles["m-staggerItemVisible"] : "", className]
        .filter(Boolean)
        .join(" ")}
      style={{ transitionDelay: `${totalDelay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}

export interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
}

export function StaggerContainer({
  children,
  className,
  as: Tag = "div",
  style,
}: StaggerContainerProps) {
  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}