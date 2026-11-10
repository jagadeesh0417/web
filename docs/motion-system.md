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
├─ reduced-motion.ts       # prefers-reduced-motion hook + helper
├─ use-in-view.ts          # IntersectionObserver "is this in view" hook
└─ use-active-step.ts      # IntersectionObserver active-step tracker (timelines)

src/components/motion/     # drop-in motion components
├─ motion.module.css       # scoped keyframes + transitions (reduced-motion safe)
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

```tsx
import { StickyHeader, NavLink, Dropdown, MobileMenu } from "@/components/motion";

<StickyHeader className="sticky top-0 z-50">
  {({ scrolled }) => (
    <nav className={scrolled ? "bg-card/80 backdrop-blur shadow-sm" : "bg-transparent"}>
      <NavLink href="/courses" active>Courses</NavLink>
      {/* dropdown state lives in your navbar component */}
      <Dropdown open={menuOpen}><div className="rounded-xl border bg-card p-3">...</div></Dropdown>
    </nav>
  )}
</StickyHeader>

<MobileMenu open={mobileOpen}>{/* mobile links */}</MobileMenu>
```

`StickyHeader` exposes `{ scrolled }` as a render prop so **only** the header subtree
re-renders when the crossing state flips (it throttles scroll with `requestAnimationFrame`
and dedupes updates). `Dropdown`/`MobileMenu` are controlled: keep the open/closed
boolean in your own navbar state.

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
(IntersectionObserver), not scroll math. Add `horizontal` for a top rail layout.

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

- **`prefers-reduced-motion` is fully supported.** `useReducedMotion()` powers every
  component: reveals and hero items render visible instantly, decorative loops (`float`,
  `heroLight`) stop or unmount, and `motion.module.css` has a `@media (prefers-reduced-motion:
  reduce)` block as a CSS-level safety net. (The project's global CSS also already neutralizes
  durations/animations - this system works with it, not against it.)
- Decorative elements (`FloatingDecor`, `HeroLight`, timeline rail/progress) are `aria-hidden`.
- `MotionButton` has a visible `:focus-visible` ring; `NavLink` sets `aria-current="page"`;
  `WorkflowTimeline` sets `aria-current="step"`.
- Motion is applied to a wrapper so semantic content (headings, links, list items) stays in
  the accessibility tree; the wrapper uses neutral containers.

---

## 6. Performance considerations

- **Transforms + opacity only** -> GPU-composited, no repaint of layout.
- **IntersectionObserver** for all scroll reveals and the timeline - no `scroll` listeners
  (the one exception, `StickyHeader`, is passive + rAF-throttled + state-deduped).
- **Run once** (`once: true` default) disconnects the observer after revealing, so nothing
  keeps watching.
- **`will-change`** is set only on elements that actually animate and is scoped in the CSS
  module (not global), so we don't create a compositor layer for everything.
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
   keep the open/closed booleans (and click-outside/Escape handling) in the navbar component.
   `StickyHeader` can wrap the existing `<header>` content via its render prop.
6. **Colors:** the effects reference the theme via `var(--border)`, `var(--border-gold)`,
   `var(--primary)`, `var(--ring)`, `var(--card)` with charcoal/gold/orange fallbacks, so they
   follow whatever the global theme resolves to. Do not hardcode palette values into new theme
   files.
7. **If you standardize timing**, change `tokens.ts` and mirror it in `motion.module.css`
   (they intentionally document each other).