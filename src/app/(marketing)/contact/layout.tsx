import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact | Akradhii",
  description:
    "Contact Akradhii for websites, Meta Ads, automation, CRM, AI, SEO, branding or internship enquiries. Hyderabad studio.",
  openGraph: {
    title: "Contact | Akradhii",
    description: "Let's build something together.",
    url: `${siteConfig.url}/contact`,
  },
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
