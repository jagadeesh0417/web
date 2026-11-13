# Akradhii Premium Motion System

A reusable, lightweight animation layer for the new Akradhii homepage. The visual
direction is cinematic charcoal-black with orange (`#F58216`) and gold (`#D6A24A`)
highlights. The system is built on **CSS transitions/transforms + Intersection
Observer**, not a heavy animation library, so it stays small, GPU-friendly, and easy
to reason about.

Everything here is **isolated**: no homepage layout files and no global CSS
(`globals.css`, `layout.tsx`, `navbar.tsx`, etc.) are touched. Integrate the pieces
below once the homepage structure is ready.

---

## 1. File map

```
src/lib/motion/            # headless utilities (hooks + design tokens)
├─ tokens.ts               # durations, easings, stagger steps, hero sequence
├─ reduced-motion-store.ts # pure prefers-reduced-motion external store (testable)
├─ reduced-motion.ts       # useReducedMotion() backed by useSyncExternalStore
├─ helpers.ts              # pure reveal/stagger/menu/timeline logic (testable)
├─ use-in-view.ts          # IntersectionObserver "is this in view" hook
└─ use-active-step.ts      # IntersectionObserver active-step tracker (timelines)

src/components/motion/     # drop-in motion components
├─ motion.module.css       # scoped keyframes + transitions (reduced-motion + hover gated)
├─ Reveal.tsx              # scroll reveal (headings, copy, single elements)
├─ Stagger.tsx             # StaggerContainer + StaggerItem (cards, grids)
├─ HoverCard.tsx           # card hover: lift + gold glow + border + icon move
├─ MotionButton.tsx        # gradient hover, glow, arrow motion, focus/active
├─ Hero.tsx                # HeroItem, FloatingDecor, HeroLight
├─ Navigation.tsx          # StickyHeader, NavLink, Dropdown, MobileMenu
├─ WorkflowTimeline.tsx    # scroll-based timeline progression
├─ index.ts                # barrel export
└─ examples/
   └─ MotionShowcase.tsx   # reference showcase (safe to delete)
```

Import from the barrel for brevity, or from the individual files:

```tsx
import { Reveal, StaggerItem, HoverCard, MotionButton } from "@/components/motion";
```

Utilities:

```tsx
import { useInView, useReducedMotion, durations, easings } from "@/lib/motion";
```

---

## 2. Required effects -> components

| Effect (from spec)                                   | Where it lives                                   |
| ---------------------------------------------------- | ------------------------------------------------ |
| Headings reveal smoothly                             | `<Reveal variant="heading">`                     |
| Supporting text fades upward                         | `<Reveal variant="up">` / `variant="fade"`       |
| Cards appear with staggered timing                   | `<StaggerContainer>` + `<StaggerItem index>`     |
| Animations run once                                  | default `once` on `Reveal`/`StaggerItem`         |
| Card hover: border highlight, glow, elevation        | `<HoverCard>` + `hoverCardIconClass`             |
| Small icon movement                                  | `hoverCardIconClass` on the icon                 |
| Buttons: gradient hover, glow, arrow, focus/active   | `<MotionButton arrow>`                           |
| Hero entrance sequence, drifting light, floats       | `HeroItem`, `HeroLight`, `FloatingDecor`         |
| Sticky header, nav underline, dropdown, mobile menu  | `StickyHeader`, `NavLink`, `Dropdown`, `MobileMenu` |
| Scroll timeline + active-step highlight              | `<WorkflowTimeline>`                             |

---

## 3. Usage examples

### Scroll reveal

```tsx
import { Reveal } from "@/components/motion";

export function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="max-w-2xl">
      <Reveal as="h2" variant="heading">{title}</Reveal>
      <Reveal variant="up" delay={120} className="mt-3 text-muted-foreground">
        {subtitle}
      </Reveal>
    </header>
  );
}
```

`Reveal` variants: `up` (default), `fade`, `scale`, `left`, `right`, `heading`.
Key props: `delay` (ms), `threshold`, `once` (default `true`), `as` (element tag).

### Staggered cards

```tsx
import { StaggerContainer, StaggerItem, HoverCard, hoverCardIconClass } from "@/components/motion";

<StaggerContainer className="grid gap-5 sm:grid-cols-2">
  {items.map((item, i) => (
    <StaggerItem key={item.id} index={i}>            {/* index drives the delay */}
      <HoverCard className="rounded-xl border bg-card p-5">
        <item.icon className={hoverCardIconClass} /> {/* subtle icon movement */}
        <h3>{item.title}</h3>
        <p>{item.body}</p>
      </HoverCard>
    </StaggerItem>
  ))}
</StaggerContainer>
```

Stagger step defaults to `staggerStep` (80ms) and is set by `index * step + delay`.
`HoverCard` needs the card's own `border`/`bg` classes; it only adds the motion.

### Buttons

```tsx
import { MotionButton } from "@/components/motion";

<MotionButton href="/internships" arrow>Start learning</MotionButton>
<MotionButton variant="ghost" size="sm">View syllabus</MotionButton>
```

Gradient hover, subtle glow, arrow translate on hover, `scale(0.98)` on active, and a
ring `:focus-visible` are all built in. Pass `href` to render an `<a>`.

### Hero

```tsx
import { HeroItem, HeroLight, FloatingDecor } from "@/components/motion";

<div className="relative overflow-hidden">
  <HeroLight className="right-[-10%] top-[-20%] h-72 w-72 bg-[color-mix(in_srgb,#F58216_25%,transparent)]" />
  <FloatingDecor className="absolute right-10 top-10"><Sparkles /></FloatingDecor>

  <HeroItem step="eyebrow">Akradhii</HeroItem>
  <HeroItem step="title">Build the future</HeroItem>
  <HeroItem step="subtitle">Courses, internships and mentorship.</HeroItem>
  <HeroItem step="cta"><MotionButton arrow>Explore</MotionButton></HeroItem>
</div>
```

`HeroItem step` reads the timing from `heroSequence` in `tokens.ts` so the whole
entrance stays on one schedule. `HeroLight` is decorative (pointer-events off,
`aria-hidden`).

### Navigation

`StickyHeader` is a **sticky bar wrapper, not a landmark** — it renders a `<div>` by
default so it cannot accidentally create a second `<header>`/banner landmark. Put it
inside the page's single top-level header (or the site `<nav>`), or pass `as="header"`
only when it *is* the sole banner.

```tsx
import { StickyHeader, NavLink, Dropdown, MobileMenu } from "@/components/motion";

<div className="sticky top-0 z-50">
  <StickyHeader>
    {({ scrolled }) => (
      <nav className={scrolled ? "bg-card/80 backdrop-blur shadow-sm" : "bg-transparent"}>
        <NavLink href="/courses" active>Courses</NavLink>
        {/* dropdown state lives in your navbar component */}
        <Dropdown open={menuOpen}><div className="rounded-xl border bg-card p-3">...</div></Dropdown>
      </nav>
    )}
  </StickyHeader>
</div>

<MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} label="Mobile" labelledBy="menu-button" id="mobile-menu">
  {/* mobile links */}
</MobileMenu>
```

`StickyHeader` exposes `{ scrolled }` as a render prop and also sets `data-scrolled` on the
wrapper, so styling can live entirely in CSS if you prefer (throttled with `requestAnimationFrame`
and deduped — only re-renders when the crossing state flips).

`Dropdown` and `MobileMenu` are controlled and handle accessibility/focus internally:
- When closed they set `aria-hidden` **and** the `inert` attribute, so hidden links drop out
  of the tab order (no "focus into invisible menu" bug).
- `MobileMenu` closes on **Escape** when you pass `onClose`, moves focus into the panel when
  it opens (`preventScroll`, so no layout jump) and exposes `id`/`aria-controls`/`aria-labelledby`
  for a proper disclosure button. Keep the open/closed boolean and click-outside handling in
  your navbar component.

### Workflow timeline

```tsx
import { WorkflowTimeline } from "@/components/motion";

<WorkflowTimeline
  steps={[
    { title: "Discover", description: "Understand goals." },
    { title: "Design", description: "Prototype the visuals." },
    { title: "Build", description: "Develop with a performant stack." },
    { title: "Launch", description: "Ship and iterate." },
  ]}
/>
```

The progress rail and active-step highlight are driven by `useActiveStep`
(IntersectionObserver), not scroll math. Add `horizontal` for a top-rail layout. The
horizontal variant is responsive: one column on mobile and an even grid of `steps.length`
columns (clamped to 6, via the `--m-cols` custom property) at `md+`.

---

## 4. Motion timing & easing guidelines

Tokens live in `src/lib/motion/tokens.ts` and mirror `motion.module.css`.

**Durations**
- `fast` 150ms - micro feedback (hover color, small icon moves)
- `base` 300ms - nav underline, dropdown, button glow
- `slow` 500ms - staggered cards
- `slower` 700ms - hero + heading reveals
- Keep any single reveal under ~800ms; never over-animate.

**Easings** (`easings` / `easingCss`)
- `standard` cubic-bezier(0.2, 0, 0.2, 1) - default UI
- `decelerate` cubic-bezier(0, 0, 0.2, 1) - entering elements
- `accelerate` cubic-bezier(0.4, 0, 1, 1) - exiting elements
- `cinematic` cubic-bezier(0.21, 0.47, 0.32, 0.98) - reveals & hero (default here)
- `spring` - use sparingly, tiny overshoot only

**Stagger**: `staggerStep = 80ms`. For long lists cap the effective delay
(`Math.min(index, 6) * staggerStep`) so later cards don't feel laggy.

**Hero sequence** (`heroSequence`): eyebrow 0, title 120, subtitle 260, cta 420, visual 520ms.

**Layout & size**: animate only `transform` and `opacity` (plus `box-shadow`/`border-color`
on hover). Never animate `width/height/top/left` - it causes layout shift. Elements keep
their final size while hidden (opacity/transform only), so there is no reflow.

---

## 5. Accessibility

- **Hydration-safe `prefers-reduced-motion`.** `useReducedMotion()` is backed by
  `useSyncExternalStore`: the server snapshot and the first client render both return
  `false` (so SSR and hydration markup are identical — no hydration warning), then the
  real browser preference is read after hydration and subscribed to for changes. Reveals
  and hero items flip to their visible state instantly when reduced motion is set.
- **CSS safety net.** `motion.module.css` still has a `@media (prefers-reduced-motion:
  reduce)` block that neutralises transforms/animation even before JS runs, and the
  project's global CSS already collapses durations/animations — this system works with it,
  not against it.
- **Touch-friendly hover.** Elevation, glow, gradient-sweep and underline hover effects are
  wrapped in `@media (hover: hover) and (pointer: fine)`, so nothing "sticks" after a tap.
  `:focus-visible` rings and `:active` feedback stay ungated and work on every device.
- **Menus are inert when hidden.** Closed `Dropdown`/`MobileMenu` set `aria-hidden` **and**
  `inert`, removing their links from the tab order. `MobileMenu` supports Escape-to-close and
  focuses into the panel on open (`preventScroll`).
- Decorative elements (`FloatingDecor`, `HeroLight`, timeline rail/progress) are `aria-hidden`.
- `MotionButton` has a visible `:focus-visible` ring; `NavLink` sets `aria-current="page"`;
  `WorkflowTimeline` sets `aria-current="step"`; `StickyHeader` renders no landmark by default.
- Motion is applied to a wrapper so semantic content (headings, links, list items) stays in
  the accessibility tree; the wrapper uses neutral containers.

---

## 6. Performance considerations

- **Transforms + opacity only** -> GPU-composited, no repaint of layout. The mobile menu
  animates `grid-template-rows` (`0fr -> 1fr`) instead of `max-height`, so it never clips
  content, reserves no phantom space when closed, and avoids magic viewport numbers.
- **IntersectionObserver** for all scroll reveals and the timeline - no `scroll` listeners
  (the one exception, `StickyHeader`, is passive + rAF-throttled + state-deduped).
- **Stable observer lifecycle.** `useInView` memoises its callback ref with `useCallback` and
  owns the observer inside a single `useEffect` (value-serialised `threshold`), so an unrelated
  parent re-render no longer tears the observer down and rebuilds it.
- **Run once** (`once: true` default) disconnects the observer after revealing, so nothing
  keeps watching.
- **`will-change` is used sparingly** — it was removed from the reveal and hover-card base
  styles (leaving it on permanently pins a compositor layer for every element). It only stays on
  continuously-animated decorative layers, and the reduced-motion block clears it.
- **No new dependencies.** Uses native CSS + React hooks. `framer-motion` is not required for
  any of these components (kept out to stay lightweight).
- **No re-renders per scroll:** `useInView`/`useActiveStep` only `setState` on a genuine
  change, and each element owns its own observer callback.
- **Scoped CSS module** loads once and is code-split with the components that use it.

---

## 7. Integration instructions

1. **Merge order:** this branch (`redesign/animations`) is isolated. Merge it **after** the
   homepage structure (`feat/homepage-*` / `redesign/*`) is in place, then wire components in.
   Nothing here edits shared files, so there is no conflict surface with layout/theme work.
2. **No global setup needed.** The CSS is a scoped module imported by the components. You do
   **not** need to touch `globals.css` or `layout.tsx`.
3. **Reference is fine to delete:** `src/components/motion/examples/MotionShowcase.tsx`
   is a demo. Mount it on a scratch route while building, then remove it before production.
4. **Card hover:** `HoverCard` only supplies motion classes - bring your own
   `border` / `bg` / `rounded` (or reuse `@/components/ui/card`).
5. **Nav state stays in your navbar:** `Dropdown` and `MobileMenu` are controlled wrappers;
   keep the open/closed booleans (and click-outside handling) in the navbar component and pass
   `onClose` to `MobileMenu` to enable Escape-to-close. `StickyHeader` renders a `<div>` by
   default and does **not** emit a landmark - place it inside the page's single `<header>`
   (or pass `as="header"` only if it is the only banner), keeping one `<nav>` inside.
6. **Colors:** the effects reference the theme via `var(--border)`, `var(--border-gold)`,
   `var(--primary)`, `var(--ring)`, `var(--card)` with charcoal/gold/orange fallbacks, so they
   follow whatever the global theme resolves to. Do not hardcode palette values into new theme
   files.
7. **If you standardize timing**, change `tokens.ts` and mirror it in `motion.module.css`
   (they intentionally document each other).

---

## 8. Testing

```bash
node --test tests/motion.test.mjs tests/motion-source.test.mjs
```

- `tests/motion.test.mjs` exercises the pure logic (Node runs the `.ts` modules directly via
  type-stripping): the reduced-motion external store (server snapshot always `false`, client
  snapshot reads `matchMedia`, subscribe/cleanup, preference-change firing), reveal/stagger
  show+delay, mobile-menu aria/inert state, Escape handling and timeline column/progress math.
- `tests/motion-source.test.mjs` guards the specific review fixes at the source level: the hook
  uses `useSyncExternalStore` with a fixed server snapshot (no `matchMedia` during render),
  `useInView` memoises its ref and disconnects on cleanup, hover is gated behind
  `(hover: hover) and (pointer: fine)`, the mobile menu uses `grid-template-rows` (not
  `max-height`), the timeline defines a concrete `--m-cols`, and `StickyHeader` renders a
  `div` by default.

### Remaining notes / not covered in this pass
- **Live browser hydration is not executed in CI.** Node's test runner cannot mount the JSX
  components or run IntersectionObserver against a real viewport, so the store/hook logic is
  unit-tested and the fixes are source-guarded. A real hydration check (React DevTools + a
  reduced-motion OS setting and a touch device) should be done once during Homepage V2
  integration / QA.
- `StickyHeader` still uses one passive, rAF-throttled scroll listener (by design, to report
  `scrolled`). If the homepage nav is a `position: sticky` element you may instead prefer
  a sentinel `IntersectionObserver` to avoid the listener entirely - left as-is to keep the
  public render-prop API stable.