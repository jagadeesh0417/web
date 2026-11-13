/**
 * Homepage visual asset map.
 *
 * Paths and alt text mirror `public/visual-assets/manifest.json` (commit
 * 60f2d2f on `redesign/visual-assets`). All files are original, owned SVGs.
 * Icons are rendered with `next/image` `unoptimized` so they do not depend on
 * the image optimizer's SVG allow-list.
 */

const BASE = "/visual-assets";

export type ServiceVisual = {
  icon: string;
  illustration: string;
  iconAlt: string;
  illustrationAlt: string;
};

/** Keyed by `services[].id` in `src/config/site.ts`. */
export const serviceVisuals: Record<string, ServiceVisual> = {
  "web-development": {
    icon: `${BASE}/services/icon-web-development.svg`,
    illustration: `${BASE}/services/illustration-web-development.svg`,
    iconAlt: "Website Design and Development icon",
    illustrationAlt: "Website Design and Development illustration",
  },
  "meta-ads": {
    icon: `${BASE}/services/icon-meta-ads.svg`,
    illustration: `${BASE}/services/illustration-meta-ads.svg`,
    iconAlt: "Meta Ads icon",
    illustrationAlt: "Meta Ads illustration",
  },
  automation: {
    icon: `${BASE}/services/icon-business-automation.svg`,
    illustration: `${BASE}/services/illustration-business-automation.svg`,
    iconAlt: "Business Automation icon",
    illustrationAlt: "Business Automation illustration",
  },
  crm: {
    icon: `${BASE}/services/icon-crm-solutions.svg`,
    illustration: `${BASE}/services/illustration-crm-solutions.svg`,
    iconAlt: "CRM Solutions icon",
    illustrationAlt: "CRM Solutions illustration",
  },
  "ai-automation": {
    icon: `${BASE}/services/icon-ai-automation.svg`,
    illustration: `${BASE}/services/illustration-ai-automation.svg`,
    iconAlt: "AI Automation icon",
    illustrationAlt: "AI Automation illustration",
  },
  seo: {
    icon: `${BASE}/services/icon-seo.svg`,
    illustration: `${BASE}/services/illustration-seo.svg`,
    iconAlt: "SEO icon",
    illustrationAlt: "SEO illustration",
  },
  branding: {
    icon: `${BASE}/services/icon-branding.svg`,
    illustration: `${BASE}/services/illustration-branding.svg`,
    iconAlt: "Branding icon",
    illustrationAlt: "Branding illustration",
  },
};

export const heroArt = {
  desktop: `${BASE}/hero/hero-cinematic-desktop.svg`,
  tablet: `${BASE}/hero/hero-cinematic-tablet.svg`,
  mobile: `${BASE}/hero/hero-cinematic-mobile.svg`,
  alt: "Akradhii cinematic hero visual — abstract analytics dashboard with orange and gold light",
} as const;

export const agencyArt = {
  intro: `${BASE}/agency/agency-intro-abstract.svg`,
  team: `${BASE}/agency/agency-team-abstract.svg`,
  workflow: `${BASE}/agency/agency-intro-workflow.svg`,
} as const;

export const backgroundArt = {
  grid: `${BASE}/backgrounds/tech-grid-dark.svg`,
  orbit: `${BASE}/backgrounds/tech-orbit-gold.svg`,
  circuit: `${BASE}/backgrounds/tech-circuit-glow.svg`,
} as const;

export const decorativeArt = {
  sparkle: `${BASE}/decorative/sparkle-particles-gold.svg`,
  ring: `${BASE}/decorative/gradient-ring-gold.svg`,
  cornerGlow: `${BASE}/decorative/corner-glow-top-right.svg`,
  dotGrid: `${BASE}/decorative/dot-grid-gold.svg`,
  hairline: `${BASE}/decorative/hairline-gold.svg`,
} as const;
