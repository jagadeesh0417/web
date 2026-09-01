import { writeFileSync } from "fs";

const posts = [
  { slug: "why-every-business-needs-ai-automation", title: "AI Automation in 2026", category: "AI Automation", colors: ["#7c3aed", "#4f46e5"] },
  { slug: "meta-ads-roas-myth", title: "The ROAS Myth", category: "Meta Ads", colors: ["#2563eb", "#06b6d4"] },
  { slug: "portfolio-that-gets-you-hired", title: "Build a Hiring Portfolio", category: "Career", colors: ["#c026d3", "#ec4899"] },
  { slug: "crm-automation-saves-small-businesses", title: "CRM Automation Saves Hours", category: "Automation", colors: ["#059669", "#14b8a6"] },
  { slug: "web-performance-core-vitals", title: "Core Web Vitals Guide", category: "Web Development", colors: ["#2563eb", "#4f46e5"] },
  { slug: "seo-strategy-2026", title: "SEO Strategy 2026", category: "SEO", colors: ["#d97706", "#ea580c"] },
  { slug: "branding-for-startups", title: "Branding for Startups", category: "Branding", colors: ["#c026d3", "#7c3aed"] },
  { slug: "internship-to-career", title: "Internship to Career", category: "Career", colors: ["#059669", "#0d9488"] },
];

for (const p of posts) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.colors[0]}"/>
      <stop offset="100%" stop-color="${p.colors[1]}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <rect x="0" y="0" width="800" height="500" fill="#0b1020" opacity="0.15"/>
  <circle cx="650" cy="100" r="120" fill="white" opacity="0.05"/>
  <circle cx="700" cy="380" r="80" fill="white" opacity="0.04"/>
  <text x="400" y="230" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="700" fill="white" opacity="0.9">${p.title}</text>
  <text x="400" y="275" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="400" fill="white" opacity="0.6" letter-spacing="2" text-transform="uppercase">${p.category}</text>
  <rect x="350" y="305" width="100" height="2" rx="1" fill="white" opacity="0.3"/>
  <text x="400" y="340" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="400" fill="white" opacity="0.4">Akradhii Blog</text>
</svg>`;
  writeFileSync(`public/blog/${p.slug}.svg`, svg);
  console.log(`Created blog/${p.slug}.svg`);
}
