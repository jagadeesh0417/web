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
  },
  alternates: { canonical: `${siteConfig.url}/verify` },
};

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
