# Visual asset plan — Akradhii premium homepage

## Approved direction

Use the approved orange/gold/charcoal homepage reference image as the visual target. The reference shows a premium dark studio composition: laptop/dashboard panel, warm orange and gold light trails, charcoal environment, and restrained luxury tech mood.

The committed assets follow the same palette and mood, but remove fake proof claims. They are intentionally vector-first so they remain sharp at desktop, tablet and mobile breakpoints.

## Brand palette extracted from the actual project

| Role | Color | Source |
|---|---:|---|
| Gold highlight | `#F4BD53` | `src/components/logo.tsx`, `src/app/globals.css` |
| Orange action | `#F58216` | `src/components/logo.tsx`, `src/app/globals.css` |
| Amber border | `#D6A24A` | `src/app/globals.css` |
| Deep orange glow | `#C75A19` | `src/app/globals.css` |
| Background charcoal | `#090A0D` | `src/app/globals.css` |
| Secondary charcoal | `#111216` | `src/app/globals.css` |
| Card charcoal | `#18191F` | `src/app/globals.css` |
| Warm border | `#423020` | `src/app/globals.css` |
| Ivory text | `#F7F4EF` | `src/app/globals.css` |
| Muted text | `#B7B4AE` | `src/app/globals.css` |
| White logo glyph | `#FFFFFF` | `src/components/logo.tsx` |

## Homepage section mapping

| Homepage section | Current visual issue | New asset plan |
|---|---|---|
| Hero | Uses `public/reference-hero.webp`, 554 × 310 low-resolution reference; labelled “Illustrative dashboard”. | Replace with `hero-cinematic-desktop/tablet/mobile.svg`. Keep text safe zones: left 45% on desktop, top third on mobile. |
| Benefits strip | Text-only CSS chips, but could feel flat. | Use `sparkle-particles-gold.svg` and `hairline-gold.svg` for subtle separation if needed. |
| Agency introduction | Uses `public/reference-about.webp`, low-res illustration labelled “Illustration”. Not a real office or team photo. | Replace with `agency-intro-abstract.svg`, `agency-intro-workflow.svg`, or `agency-team-abstract.svg` depending on message. |
| Services | Uses Lucide icons and CSS gradient cards. | Provide `services/icon-*.svg` and `illustration-*.svg` pairs for all seven services. |
| AI automation | Uses `public/reference-ai.webp`, low-res illustration labelled “Illustration”. | Use `tech-circuit-glow.svg` as background and `icon-ai-automation.svg`/`illustration-ai-automation.svg` for feature graphic. |
| Portfolio preview | `publicPortfolio` is intentionally empty; old `public/portfolio/*.svg` are sample placeholders with old violet/indigo colors. | Use portfolio layout templates only; fill with real client-approved images once supplied. Do not invent project screenshots. |
| CTA | CSS gradient panels. | Use `tech-orbit-gold.svg`, `corner-glow-top-right.svg`, `light-sweep-gold.svg`, and `underline-glow-gold.svg` for premium accents. |
| Social image | `public/og-default.svg` still uses old violet/indigo brand colors. | Use `brand/og-brand.svg` or export it to raster once approved. |

## Composition rules

1. **Dark-first:** never use purple, blue, green or stock-photo tones. Stay inside charcoal, gold, amber, orange.
2. **Premium restraint:** one focal object per section, 8–20% opacity glow layers, clean negative space for copy.
3. **No fake proof:** no invented client names, no fabricated screenshots, no fake percentages, awards, testimonials or statistics in final public assets.
4. **Text-safe areas:** hero assets leave left half or top third clear for headings and CTAs.
5. **Service parity:** all seven services get matching icon + illustration treatment.
6. **Responsiveness:** desktop, tablet and mobile variants should be selected by breakpoint; SVGs scale automatically.
7. **Accessibility:** decorative SVGs are `aria-hidden` or inserted as CSS backgrounds; meaningful SVGs include `<title>` and recommended alt text in `manifest.json`.

## Asset categories to prepare

- Hero: cinematic desktop, tablet, mobile.
- Agency introduction: abstract capability map, workflow path, abstract team network.
- Services: seven icons + seven premium illustrations.
- Backgrounds: grid technology, orbit gold, circuit glow.
- Decorative: aurora blobs, corner glow, light sweep, dot grid, gradient ring, sparkle particles, underline glow, hairline.
- Portfolio: desktop/mobile layout templates and neutral card cover slot.
- Brand: logo mark, favicon source, 512 logo reference, brand OG card.

## Missing asset strategy

Because raster image generation is unavailable in this session, no stock raster images were added. The missing-asset list includes:
- real client-approved portfolio images,
- WebP/AVIF exports of SVGs,
- multi-size favicon raster set,
- approved client logo pack,
- blog cover imagery,
- real photography if team credibility needs photos.

See `docs/visual-assets/missing-assets.md` for production-ready prompts.
