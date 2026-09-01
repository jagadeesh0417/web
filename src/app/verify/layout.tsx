import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Verify Certificate",
  description:
    "Verify the authenticity of an Akradhii internship certificate by entering the certificate ID or scanning the QR code.",
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
  return children;
}
