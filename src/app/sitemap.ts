import type { MetadataRoute } from "next";

const BASE = "https://akradhii.vercel.app";

const internships = [
  "web-development",
  "ui-ux-design",
  "meta-ads",
  "digital-marketing",
  "automation",
  "ai-automation",
  "graphic-design",
  "content-writing",
  "seo",
  "video-editing",
];

const services = [
  "web-development",
  "meta-ads",
  "automation",
  "crm",
  "ai-automation",
  "seo",
  "branding",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/internships`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/internships/apply`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/portfolio`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/verify`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const servicePages: MetadataRoute.Sitemap = services.map((slug) => ({
    url: `${BASE}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const internshipPages: MetadataRoute.Sitemap = internships.map((slug) => ({
    url: `${BASE}/internships/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...servicePages, ...internshipPages];
}
