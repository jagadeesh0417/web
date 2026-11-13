"use client";

import { Reveal as MotionReveal } from "@/components/motion/Reveal";
import type { ReactNode } from "react";

/** Marketing wrapper around the corrected motion Reveal.
 *  Accepts `delay` in seconds (legacy behaviour) and forwards it as milliseconds.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <MotionReveal delay={Math.round((delay || 0) * 1000)} className={className}>
      {children}
    </MotionReveal>
  );
}
