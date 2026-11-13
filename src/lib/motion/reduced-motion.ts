"use client";

import { useSyncExternalStore } from "react";
import {
  reducedMotionServerSnapshot,
  reducedMotionSubscribe,
  reducedMotionSnapshot,
} from "./reduced-motion-store";

/**
 * React hook returning whether the user prefers reduced motion.
 *
 * Hydration safety: this is backed by `useSyncExternalStore`, which uses
 * `reducedMotionServerSnapshot` (always `false`) for the server render AND the
 * first client render, then reads the real browser preference after hydration
 * and subscribes to changes. Server and initial-client markup therefore match,
 * eliminating the previous `matchMedia`-during-render hydration mismatch.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(reducedMotionSubscribe, reducedMotionSnapshot, reducedMotionServerSnapshot);
}