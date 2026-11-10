# Missing assets and production prompts

Image generation was attempted for raster hero art, but the local OpenCode image job failed with **Insufficient account funds**. Per task constraints, no stock photos or generic raster placeholders were substituted.

The committed SVGs are original production-safe compositions. The items below still require real approved photography, real project exports, or a working image-generation/conversion pipeline.

## 1. Real approved portfolio project images

**Status:** Missing.

The current homepage portfolio preview cannot be filled with real client-approved images in this branch. `public/portfolio/*.svg` files are old violet/indigo sample placeholders and should not be shipped. `publicPortfolio` currently contains no approved project entries.

**What is needed per project:**

| Asset | Recommended size | Format | Notes |
|---|---:|---|---|
| Project cover | 1600 × 900 | WebP + AVIF + SVG fallback | Desktop preview; safe focal point at left-center. |
| Mobile cover | 900 × 1200 | WebP + AVIF + SVG fallback | Crop-safe composition for portrait cards. |
| Case-study hero | 2400 × 1350 | WebP + AVIF | Retina desktop. |
| Thumbnail | 800 × 500 | WebP + AVIF | Grid cards. |
| Approved screenshots | 2× native | WebP + AVIF | Only if client gives written permission. |

**Required before production:**
- Client name and project slug.
- Written approval to display screenshots/logos/results.
- Any performance numbers must come from analytics or client confirmation; do not invent stats.

## 2. Premium raster hero export

**Status:** SVG production variants are committed; raster WebP/AVIF exports are missing because no SVG-to-AVIF/WebP converter was available.

**Recommended outputs:**
- `hero-cinematic-desktop@2560.webp`
- `hero-cinematic-desktop@1920.webp`
- `hero-cinematic-desktop@1280.webp`
- `hero-cinematic-tablet@1024.webp`
- `hero-cinematic-mobile@768.webp`
- `hero-cinematic-mobile@1125.webp`
- AVIF equivalents for each if browser support is required.

**Production-ready image-generation prompt for a premium cinematic hero raster:**

```text
Premium dark cinematic hero image for a digital growth agency website.
Canvas: 2560x1440, desktop composition with empty left 45% for headline and buttons.
Style: luxury tech, ultra clean, high-end editorial, realistic light, not cartoonish.
Palette: charcoal #090A0D, charcoal #111216, card #18191F, gold #F4BD53, amber #D6A24A, orange #F58216.
Subject: an abstract analytics dashboard panel made of translucent glass and gold-orange light, floating at the right side, with subtle laptop silhouette, orbiting elliptical light rings, sparse glowing particles, and soft bokeh depth.
Quality: no text, no numbers, no charts with specific values, no logos, no brand names, no people, no stock-photo clichés, no purple, no blue, no green, no random shapes, no busy details.
Mood: confident, premium, modern, restrained, conversion-focused.
```

**Mobile variant prompt:**

```text
Premium dark cinematic vertical hero image for a digital growth agency website.
Canvas: 1080x1920, mobile portrait composition with safe text area in the upper third and lower CTA area.
Style: luxury tech editorial, glass-and-light, high-end, subtle depth.
Palette: charcoal #090A0D, gold #F4BD53, amber #D6A24A, orange #F58216.
Subject: abstract glass dashboard panels, soft orbit rings and orange-gold light trails, arranged diagonally from lower right to upper left.
Quality: no readable text, no numbers, no stats, no logos, no brand names, no people, no purple, no blue, no green, no generic stock imagery.
Mood: premium, calm, modern, conversion-focused.
```

## 3. Agency introduction photography or branded raster

**Status:** Abstract SVGs are committed. If the final homepage needs real office/team credibility, approved photography is required.

**Prompt for an abstract agency visual:**

```text
Premium abstract agency collaboration visual for a website section.
Canvas: 1600x1000, horizontal, right focal point with clear left area for copy.
Subject: floating translucent glass cards connected by gold-orange paths, suggesting strategy, design, engineering and growth; soft charcoal background and warm rim light.
Palette: #090A0D, #111216, #F4BD53, #D6A24A, #F58216.
Quality: no text, no logos, no people, no fake office photos, no stock-photo clichés, no purple/blue/green, no cluttered details.
Mood: premium, senior, integrated, trustworthy.
```

**Prompt if real team photos are requested:**

```text
Professional studio photograph of a small modern digital agency team collaborating around a laptop in a dark charcoal office with warm gold accent lighting.
Use only for approved real team photos. Do not generate synthetic faces or claim these are Akradhii staff unless explicitly approved.
Canvas: 1600x1000.
Lighting: charcoal shadows, gold/orange highlights, no blue.
Quality: realistic, licensed model release, no text, no logos, no invented office sign, no fake award wall.
```

## 4. Approved client logo pack

**Status:** Missing. Do not invent logos.

Current homepage uses text labels for partners. For a logo strip, collect:
- SVG or PNG logo files from each partner.
- Written permission to show the logo.
- Monochrome versions if needed.

**Production-ready normalization prompt if logos already exist but need styling:**

```text
Convert approved client logos to one-color gold/charcoal variants. Preserve exact geometry and proportions. No redrawing, no fake logos, no new names. Use #D6A24A at 85% opacity on #111216 or #F7F4EF on #090A0D. Output SVG.
```

## 5. Blog cover images

**Status:** Existing `public/blog/*.svg` are old violet/indigo placeholders. They are unsuitable for the final brand.

**Required size:** 1600 × 900 WebP/AVIF or SVG editorial cover.
**Rules:** Only use images that match the published article; no fake analytics numbers.

**Generic prompt:**

```text
Editorial cover illustration for an article about [TOPIC] for Akradhii digital growth studio.
Canvas: 1600x900.
Style: premium abstract editorial vector/3D hybrid, charcoal base, orange/gold accents, clean typography-safe space at lower left.
No client names, no invented statistics, no fake dashboard numbers, no purple/blue/green, no stock-photo look.
Use only after article title and claims are approved.
```

## 6. Final social/OG raster exports

**Status:** `brand/og-brand.svg` is committed, but raster export is missing because no converter was available.

**Required outputs:**
- `og-brand@1200x630.webp`
- `og-brand@1200x630.avif`
- PNG fallback if social platforms reject WebP/AVIF.

**Prompt for raster conversion pipeline, not creative:**

```text
Render /public/visual-assets/brand/og-brand.svg to 1200x630 WebP and AVIF at 85–92 quality. Preserve vector text as crisp raster output. No design changes.
```

## 7. Favicon/icon set

**Status:** SVG favicon source committed; multi-size PNG/ICO set missing.

**Required outputs:**
- `favicon-16.png`, `favicon-32.png`, `favicon-48.png`, `favicon-192.png`, `favicon-512.png`
- `apple-touch-icon-180.png`
- `site.webmanifest` icons if PWA is planned.

**Prompt for raster conversion pipeline:**

```text
Render /public/visual-assets/brand/logo-mark-512.svg to PNG icons at 16, 32, 48, 180, 192 and 512 pixels. Preserve rounded square and white A mark exactly. No redesign.
```

## 8. Service illustration raster set

**Status:** SVG icon/illustration set is complete. Raster fallbacks are optional.

If a CMS or social platform requires raster:

```text
Render each service SVG in /public/visual-assets/services/ to 512px and 128px WebP/AVIF with transparent background. Do not alter icon geometry.
```
