import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Akradhii for websites, Meta Ads, automation, CRM, AI, SEO, branding or internship enquiries. Hyderabad studio.",
  keywords: [
    "contact akradhii",
    "hire digital agency hyderabad",
    "web development enquiry",
    "digital marketing agency contact",
  ],
  openGraph: {
    title: "Contact",
    description: "Let's build something together.",
    url: `${siteConfig.url}/contact`,
    images: [
      {
        url: `${siteConfig.url}/og-default.svg`,
        width: 1200,
        height: 630,
        alt: "Contact Akradhii",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${siteConfig.url}/og-default.svg`],
  },
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
