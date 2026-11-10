"use client";

import { useCallback, useEffect, useState } from "react";

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
 *
 * Lifecycle: the callback `ref` is stable (memoised with `useCallback`, empty
 * deps) and only tracks the DOM node into state; the observer is created inside
 * a single `useEffect`. This means an unrelated parent re-render no longer
 * changes the ref identity, so the observer is NOT torn down and recreated on
 * every render — it is only rebuilt when the node or the (value-serialised)
 * options actually change.
 */
export function useInView<T extends Element = Element>(
  options: InViewOptions = {},
): { ref: (node: T | null) => void; inView: boolean } {
  const { once = true, threshold = 0.15, rootMargin = "0px", disabled = false } = options;
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState<boolean>(false);

  const ref = useCallback((next: T | null) => {
    setNode((prev) => (prev === next ? prev : next));
  }, []);

  // Serialise threshold so an inline array with equal values doesn't retrigger the effect.
  const thresholdKey = Array.isArray(threshold) ? threshold.join(",") : String(threshold);

  useEffect(() => {
    if (!node || disabled) {
      setInView((prev) => (prev === false ? prev : false));
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
    // `threshold`/`once`/`rootMargin`/`disabled` are captured by the render that
    // produced this `thresholdKey`; depending on the key avoids array-identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, once, rootMargin, disabled, thresholdKey]);

  return { ref, inView };
}