/**
 * Reduced-motion external store (framework-free core).
 *
 * Kept in its own module so the snapshot/subscribe logic is unit-testable in
 * plain Node without React, and so `useSyncExternalStore` gets stable function
 * identities (no re-subscription churn on every render).
 */

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Read the current reduced-motion preference. Server-safe (returns false). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Server + first-client snapshot: always `false` so SSR and hydration markup match. */
export function reducedMotionServerSnapshot(): boolean {
  return false;
}

/** Client snapshot: the real browser preference (read after hydration). */
export function reducedMotionSnapshot(): boolean {
  return prefersReducedMotion();
}

/** Subscribe to preference changes; returns an unsubscribe function. */
export function reducedMotionSubscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  // Safari < 14 has only addListener/removeListener.
  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }
  mql.addListener(onChange);
  return () => mql.removeListener(onChange);
}