import { writeFileSync } from "fs";

const projects = [
  { slug: "novapay-fintech", title: "NovaPay Fintech", category: "Web Development", colors: ["#7c3aed", "#4f46e5"] },
  { slug: "zenith-skincare-meta", title: "Zenith Skincare", category: "Meta Ads", colors: ["#2563eb", "#06b6d4"] },
  { slug: "cloudpeak-crm", title: "CloudPeak CRM", category: "Business Automation", colors: ["#059669", "#14b8a6"] },
  { slug: "sprintly-brand", title: "Sprintly Brand", category: "Branding", colors: ["#c026d3", "#ec4899"] },
  { slug: "novapay-crm-pipeline", title: "NovaPay CRM", category: "CRM", colors: ["#2563eb", "#4f46e5"] },
  { slug: "zenith-ecommerce", title: "Zenith E-commerce", category: "Web Development", colors: ["#7c3aed", "#2563eb"] },
];

for (const p of projects) {
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
  <circle cx="100" cy="400" r="60" fill="white" opacity="0.03"/>
  <text x="400" y="230" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="700" fill="white" opacity="0.9">${p.title}</text>
  <text x="400" y="275" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="400" fill="white" opacity="0.6" letter-spacing="2" text-transform="uppercase">${p.category}</text>
  <rect x="340" y="310" width="120" height="2" rx="1" fill="white" opacity="0.3"/>
  <text x="400" y="350" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="400" fill="white" opacity="0.4">Akradhii Portfolio</text>
</svg>`;
  writeFileSync(`public/portfolio/${p.slug}.svg`, svg);
  console.log(`Created ${p.slug}.svg`);
}
