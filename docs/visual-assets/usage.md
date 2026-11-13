# Image usage documentation — Akradhii homepage premium visual assets

Directory: `public/visual-assets/`
Manifest: `public/visual-assets/manifest.json`
Inventory: `docs/visual-assets/inventory.md`

## Purpose

This directory contains the premium visual asset collection prepared for the new Akradhii homepage. All committed visual assets are **original, hand-authored SVG vectors** owned by the project. No random stock photos, generic placeholder photos, invented client screenshots, client logos, awards, testimonials or statistics were added.

## Brand colors used

These colors were extracted from the existing brand implementation:

| Token | Color | Source |
|---|---:|---|
| Logo gradient start | `#F4BD53` | `src/components/logo.tsx` |
| Logo gradient end / accent orange | `#F58216` | `src/components/logo.tsx`, `src/app/globals.css` |
| Gold border / primary | `#D6A24A` | `src/app/globals.css` |
| Text gradient third stop | `#D6A24A` | `src/app/globals.css` line 165 |
| Deep orange glow | `#C75A19` | `src/app/globals.css` line 172 |
| Primary charcoal background | `#090A0D` | `src/app/globals.css` |
| Secondary charcoal background | `#111216` | `src/app/globals.css` |
| Card charcoal background | `#18191F` | `src/app/globals.css` |
| Warm border | `#423020` | `src/app/globals.css` |
| Ivory text | `#F7F4EF` | `src/app/globals.css` |
| Muted text | `#B7B4AE` | `src/app/globals.css` |
| Logo glyph | `#FFFFFF` | `src/components/logo.tsx` |

## Format decision

- **Primary format: SVG.** Suitable for hero frames, service graphics, backgrounds, decorative effects, logos and layout templates.
- SVG is responsive, lightweight and crisp at every breakpoint.
- WebP/AVIF are recommended only after raster artwork is approved and a converter is available. Do not export the current reference WebP files as final assets; they are low-resolution reference images.

## Directory map

```text
public/visual-assets/
├── brand/        Logo mark, favicon source, brand social card.
├── hero/         Desktop, tablet and mobile hero compositions.
├── agency/       Agency introduction and team/process visuals.
├── services/     Seven service icon/illustration pairs.
├── backgrounds/  Abstract technology-themed backgrounds.
├── decorative/   Orange/gold shapes and light effects.
├── portfolio/    Neutral portfolio preview layout templates; no fake client work.
└── manifest.json Machine-readable asset list with paths, sizes and alt text.
```

## Filename convention

Use lowercase hyphenated semantic names:

```text
[section]-[subject]-[variant].svg
```

Examples:

- `hero-cinematic-desktop.svg`
- `icon-web-development.svg`
- `illustration-ai-automation.svg`
- `tech-circuit-glow.svg`
- `aurora-blob-orange.svg`
- `portfolio-preview-layout-desktop.svg`

For future raster exports, keep the same stem and add the intended breakpoint/quality suffix:

```text
hero-cinematic-desktop@2560.webp
hero-cinematic-desktop@1600.webp
hero-cinematic-desktop@960.webp
hero-cinematic-desktop@2560.avif
hero-cinematic-desktop@1600.avif
hero-cinematic-desktop@960.avif
```

## Responsive usage recommendations

### Hero

| File | Best breakpoint | Recommended use | Next.js note |
|---|---|---|---|
| `hero-cinematic-desktop.svg` | `>= 1024px` | Main hero art or right-side visual panel | Use with `<Image ... quality={100}>` if using `next/image`; SVG needs `dangerouslyAllowSVG` only if Next config is changed elsewhere. |
| `hero-cinematic-tablet.svg` | `640–1023px` | Tablet composition with larger dashboard panel | Same as desktop. |
| `hero-cinematic-mobile.svg` | `< 640px` | Tall mobile composition that survives cropping | Same as desktop. |

Suggested CSS pattern, if the homepage component is later approved to use these assets:

```css
.home-hero-image {
  background-image: url("/visual-assets/hero/hero-cinematic-mobile.svg");
}

@media (min-width: 640px) {
  .home-hero-image {
    background-image: url("/visual-assets/hero/hero-cinematic-tablet.svg");
  }
}

@media (min-width: 1024px) {
  .home-hero-image {
    background-image: url("/visual-assets/hero/hero-cinematic-desktop.svg");
  }
}
```

If using `srcset` with `next/image` for raster exports later:

```html
<img
  src="/visual-assets/hero/hero-cinematic-desktop@1600.webp"
  srcset="
    /visual-assets/hero/hero-cinematic-mobile@768.webp 768w,
    /visual-assets/hero/hero-cinematic-tablet@1024.webp 1024w,
    /visual-assets/hero/hero-cinematic-desktop@1600.webp 1600w,
    /visual-assets/hero/hero-cinematic-desktop@2560.webp 2560w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 54vw"
  alt="Premium dark hero composition with orange and gold light and an abstract analytics panel"
/>
```

### Services

Use `icon-*.svg` in card headers and `illustration-*.svg` where a richer, standalone graphic is needed.

| Service | Icon file | Illustration file | Recommended alt |
|---|---|---|---|
| Website Design & Development | `services/icon-web-development.svg` | `services/illustration-web-development.svg` | Website Design and Development icon with Akradhii gold-orange gradient |
| Meta Ads | `services/icon-meta-ads.svg` | `services/illustration-meta-ads.svg` | Meta Ads icon with Akradhii gold-orange gradient |
| Business Automation | `services/icon-business-automation.svg` | `services/illustration-business-automation.svg` | Business Automation icon with Akradhii gold-orange gradient |
| CRM Solutions | `services/icon-crm-solutions.svg` | `services/illustration-crm-solutions.svg` | CRM Solutions icon with Akradhii gold-orange gradient |
| AI Automation | `services/icon-ai-automation.svg` | `services/illustration-ai-automation.svg` | AI Automation icon with Akradhii gold-orange gradient |
| SEO | `services/icon-seo.svg` | `services/illustration-seo.svg` | SEO icon with Akradhii gold-orange gradient |
| Branding | `services/icon-branding.svg` | `services/illustration-branding.svg` | Branding icon with Akradhii gold-orange gradient |

### Agency introduction

| File | Use | Recommended alt |
|---|---|---|
| `agency/agency-intro-abstract.svg` | Large visual beside “About Akradhii” or “Your partner for growth” | Abstract composition showing strategy, design, engineering and growth connected by Akradhii gold and orange light |
| `agency/agency-intro-workflow.svg` | Process section or horizontal feature band | Four-step abstract workflow path in orange and gold on charcoal |
| `agency/agency-team-abstract.svg` | Team/agency credibility band without real photography | Abstract connected-team composition in orange and gold; no real portraits |

### Backgrounds

| File | Use | Accessibility |
|---|---|---|
| `backgrounds/tech-grid-dark.svg` | General dark section background | Add as CSS layer or mark `aria-hidden="true"` if decorative |
| `backgrounds/tech-orbit-gold.svg` | Hero band, CTA band, AI section | Decorative; no alt needed |
| `backgrounds/tech-circuit-glow.svg` | Technology/AI feature sections | Decorative; no alt needed |

### Decorative effects

Use with `pointer-events: none;` and low opacity when placed over text.

| File | Use |
|---|---|
| `aurora-blob-orange.svg` | Corner or side glow |
| `aurora-blob-gold.svg` | Secondary warm glow |
| `corner-glow-top-right.svg` | Full-width top-right glow overlay |
| `light-sweep-gold.svg` | Horizontal accent sweep under headings or CTA |
| `dot-grid-gold.svg` | Subtle texture panel |
| `gradient-ring-gold.svg` | Floating orbit/tech ring |
| `sparkle-particles-gold.svg` | Tiny particles over dark hero |
| `underline-glow-gold.svg` | Heading underline accent |
| `hairline-gold.svg` | Section divider |

### Brand assets

| File | Use | Recommended alt |
|---|---|---|
| `brand/logo-mark.svg` | 36×36 logo mark from existing logo geometry | Akradhii logo mark |
| `brand/logo-mark-512.svg` | App-icon/logo reference export | Akradhii logo mark, 512px reference |
| `brand/favicon.svg` | Favicon source, same mark geometry | Akradhii favicon |
| `brand/og-brand.svg` | Default social/share image replacing old violet OG asset | Akradhii open graph image with logo and services list |

### Portfolio layouts

Use only as **layout references** until real approved project images are supplied. Do not present these as case studies.

| File | Use | Recommended alt |
|---|---|---|
| `portfolio/portfolio-preview-layout-desktop.svg` | Desktop four-card composition guide | Portfolio preview desktop layout template |
| `portfolio/portfolio-preview-layout-mobile.svg` | Mobile stacked composition guide | Portfolio preview mobile layout template |
| `portfolio/portfolio-card-cover-slot.svg` | Neutral cover slot for future real project image | Portfolio card cover slot template |

## Accessibility rules

- Decorative backgrounds/effects should use `aria-hidden="true"` when inserted as `<img>`, or `background-image` layers in CSS.
- Content visuals should keep descriptive alt text from `manifest.json`.
- Do not add alt text that implies real client results unless a real, approved project image exists.
- Avoid placing body copy directly over the highest-contrast glow areas; preferred clear zones:
  - Desktop hero text panel: left 45%.
  - Tablet hero: left/top area above dashboard.
  - Mobile hero: top and bottom thirds.

## Licensing and provenance

- All SVGs in `public/visual-assets/` are original vector assets created for this project.
- Logo mark geometry was extracted from the existing owned `src/components/logo.tsx`, not redrawn from a third-party logo.
- No stock images were used.
- Missing assets are listed in `docs/visual-assets/missing-assets.md`; production prompts are included there.
