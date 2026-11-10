"use client";

import { useEffect, useRef, useState } from "react";

export interface InViewOptions {
  /** Fire only the first time the element enters the viewport. Default true. */
  once?: boolean;
  /** Intersection threshold 0..1. Default 0.15. */
  threshold?: number | number[];
  /** Root margin string, e.g. "-80px". Default "0px". */
  rootMargin?: string;
  /** Disable observation entirely (e.g. reduced motion). */
  disabled?: boolean;
}

/**
 * Observe an element with IntersectionObserver and return whether it is in view.
 * Falls back to `true` when IntersectionObserver is unavailable.
 */
export function useInView<T extends Element = Element>(
  options: InViewOptions = {},
): { ref: (node: T | null) => void; inView: boolean } {
  const { once = true, threshold = 0.15, rootMargin = "0px", disabled = false } = options;
  const [inView, setInView] = useState<boolean>(false);
  const nodeRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = (node: T | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    nodeRef.current = node;
    if (!node || disabled) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) obs.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );
    obs.observe(node);
    observerRef.current = obs;
  };

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  return { ref, inView };
}