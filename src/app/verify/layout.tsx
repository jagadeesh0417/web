import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Verify Certificate",
  description:
    "Request manual verification of an Akradhii internship certificate from support.",
  openGraph: {
    title: "Verify Certificate",
    description: "Public certificate authenticity verification.",
    url: `${siteConfig.url}/verify`,
    images: [
      {
        url: `${siteConfig.url}/og-default.svg`,
        width: 1200,
        height: 630,
        alt: "Verify Akradhii Certificate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${siteConfig.url}/og-default.svg`],
  },
  alternates: { canonical: `${siteConfig.url}/verify` },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  const schema = { "@context": "https://schema.org", "@type": "WebPage", name: "Verify an Akradhii certificate", url: `${siteConfig.url}/verify`, description: "Verify an Akradhii internship certificate." };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />{children}</>;
}
