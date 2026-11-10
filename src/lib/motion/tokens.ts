/**
 * Motion timing & easing tokens for the Akradhii premium motion system.
 *
 * Keep these in sync with `src/components/motion/motion.module.css`.
 * Prefer CSS transitions/transforms; these tokens mirror the CSS custom values.
 */

export const durations = {
  instant: 0,
  fast: 150,
  base: 300,
  slow: 500,
  slower: 700,
  hero: 900,
} as const;

export type DurationKey = keyof typeof durations;

/** Cubic-bezier tuples (CSS `cubic-bezier(...)`). */
export const easings = {
  /** Default UI transition. */
  standard: [0.2, 0.0, 0.2, 1.0] as const,
  /** Entering elements (decelerate). */
  decelerate: [0.0, 0.0, 0.2, 1.0] as const,
  /** Exiting elements (accelerate). */
  accelerate: [0.4, 0.0, 1.0, 1.0] as const,
  /** Sharp, snappy. */
  sharp: [0.4, 0.0, 0.6, 1.0] as const,
  /** Smooth cinematic (used for reveals). */
  cinematic: [0.21, 0.47, 0.32, 0.98] as const,
  /** Spring-like overshoot (use sparingly). */
  spring: [0.34, 1.56, 0.64, 1.0] as const,
} as const;

export type EasingKey = keyof typeof easings;

export const easingCss: Record<EasingKey, string> = {
  standard: "cubic-bezier(0.2, 0, 0.2, 1)",
  decelerate: "cubic-bezier(0, 0, 0.2, 1)",
  accelerate: "cubic-bezier(0.4, 0, 1, 1)",
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  cinematic: "cubic-bezier(0.21, 0.47, 0.32, 0.98)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

/** Stagger step between siblings (ms). */
export const staggerStep = 80;

/** Default reveal offset (px). */
export const revealOffset = 20;

/** Hero entrance sequence delays (ms). */
export const heroSequence = {
  eyebrow: 0,
  title: 120,
  subtitle: 260,
  cta: 420,
  visual: 520,
} as const;