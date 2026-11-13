"use client";

import { useEffect, useRef, useState } from "react";

export interface ActiveStepOptions {
  /** Intersection threshold for a step to be considered active. Default 0.4. */
  threshold?: number;
  /** Root margin. Default "-20% 0px -40% 0px" (active band in middle of viewport). */
  rootMargin?: string;
  /** Disable observation. */
  disabled?: boolean;
}

/**
 * Track which of a list of step elements is currently active based on scroll position.
 * Uses IntersectionObserver (no scroll listeners). Returns the index of the active step.
 */
export function useActiveStep(
  count: number,
  options: ActiveStepOptions = {},
): { setStepRef: (index: number) => (node: HTMLElement | null) => void; activeIndex: number } {
  const { threshold = 0.4, rootMargin = "-20% 0px -40% 0px", disabled = false } = options;
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const visible = useRef<Set<number>>(new Set());

  const setStepRef = (index: number) => (node: HTMLElement | null) => {
    refs.current[index] = node;
  };

  useEffect(() => {
    if (disabled || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const idx = refs.current.indexOf(entry.target as HTMLElement);
          if (idx === -1) continue;
          if (entry.isIntersecting) visible.current.add(idx);
          else visible.current.delete(idx);
        }
        // Active = highest visible index (top-most in document order among visible)
        if (visible.current.size > 0) {
          const next = Math.max(...Array.from(visible.current));
          setActiveIndex(next);
        }
      },
      { threshold, rootMargin },
    );
    refs.current.forEach((el) => {
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [count, disabled, threshold, rootMargin]);

  return { setStepRef, activeIndex };
}