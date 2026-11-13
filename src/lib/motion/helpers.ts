/**
 * Pure, framework-free decision helpers for the motion system.
 *
 * These are consumed by the `.tsx` components so the logic (aria/inert state,
 * Escape handling, reveal visibility, timeline columns) can be unit-tested in
 * plain Node — where JSX cannot be executed by Node's type-stripping loader.
 */

/** Whether a reveal element should show given reduced motion + in-view state. */
export function computeRevealShow(reduced: boolean, inView: boolean): boolean {
  return reduced || inView;
}

/** Reveal transition delay: 0 when motion is reduced, otherwise the requested ms. */
export function computeRevealDelay(reduced: boolean, delay: number): number {
  return reduced ? 0 : Math.max(0, delay);
}

/** Stagger delay for item `index` (capped so late items don't feel laggy). */
export function computeStaggerDelay(
  reduced: boolean,
  index: number,
  step: number,
  baseDelay = 0,
  maxItems = 6,
): number {
  if (reduced) return 0;
  const capped = Math.max(0, Math.min(index, maxItems));
  return baseDelay + capped * step;
}

/** Accessibility + visibility attributes for a collapsed/expanded mobile menu. */
export function mobileMenuAria(open: boolean): { "aria-hidden": boolean; inert: boolean } {
  return { "aria-hidden": !open, inert: !open };
}

/**
 * Global menu keydown handler. Returns `true` when the event was handled.
 * Calls `onClose` for Escape (keyboard + screen-reader friendly dismissal).
 */
export function handleMenuKeyDown(
  event: { key: string },
  handlers: { onClose?: () => void; onTabOut?: () => void },
): boolean {
  if (event.key === "Escape" || event.key === "Esc") {
    handlers.onClose?.();
    return true;
  }
  if (event.key === "Tab" && handlers.onTabOut) {
    // Let the caller decide focus wrapping/trapping for the last Tab press.
    handlers.onTabOut();
    return false;
  }
  return false;
}

/**
 * Inline CSS custom properties for the horizontal timeline grid.
 * Bounds the column count to a sane range and always defines `--m-cols` so the
 * CSS `repeat(var(--m-cols, ...))` never resolves to an invalid value.
 */
export function timelineGridVars(count: number, max = 6): Record<string, string> {
  const cols = Math.max(1, Math.min(Math.floor(count) || 1, max));
  return { "--m-cols": String(cols) };
}

/** Vertical timeline fill ratio given the active step (0..1). */
export function timelineProgress(activeIndex: number, count: number): number {
  if (count <= 1) return 1;
  return Math.min(1, Math.max(0, activeIndex / (count - 1)));
}