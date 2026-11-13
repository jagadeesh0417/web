import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Akradhii for websites, Meta Ads, automation, CRM, AI, SEO, branding or internship enquiries. Bengaluru studio.",
  keywords: [
    "contact akradhii",
    "hire digital agency bengaluru",
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
  const business = {
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/contact#business`,
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Yelahanka",
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.region,
      postalCode: "560064",
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "19:00",
    },
    sameAs: Object.values(siteConfig.socials),
  };
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "ContactPage", "@id": `${siteConfig.url}/contact#page`, url: `${siteConfig.url}/contact`, name: "Contact Akradhii", about: { "@id": business["@id"] } },
      business,
    ],
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />{children}</>;
}
