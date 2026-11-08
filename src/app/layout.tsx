import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { DialogProvider } from "@/components/ui/dialog";
import { siteConfig } from "@/config/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Akradhii | Website Development, Digital Marketing & AI Automation",
    template: `%s | Akradhii`,
  },
  description: "Akradhii provides website development, digital marketing, AI automation and CRM solutions to help businesses build, automate and grow.",
  keywords: [
    "website development company in Hyderabad",
    "digital marketing agency in Hyderabad",
    "AI automation agency in India",
    "CRM development company",
    "business automation services",
    "SEO services in Hyderabad",
    "Meta Ads agency",
  ],
  openGraph: {
    type: "website",
    title: "Akradhii | Website Development, Digital Marketing & AI Automation",
    description: "Akradhii provides website development, digital marketing, AI automation and CRM solutions to help businesses build, automate and grow.",
    url: "https://www.akradhii.com",
    siteName: siteConfig.name,
    images: [{ url: "https://www.akradhii.com/favicon.ico", width: 256, height: 256, alt: "Akradhii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Akradhii | Website Development, Digital Marketing & AI Automation",
    description: "Akradhii provides website development, digital marketing, AI automation and CRM solutions to help businesses build, automate and grow.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#090A0D" },
    { media: "(prefers-color-scheme: dark)", color: "#090A0D" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('ak_theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Akradhii",
              url: "https://www.akradhii.com",
              logo: "https://www.akradhii.com/favicon.ico",
              description: "Akradhii provides website development, digital marketing, AI automation and CRM solutions.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Hyderabad",
                addressRegion: "Telangana",
                addressCountry: "IN",
              },
              sameAs: Object.values(siteConfig.socials),
            }),
          }}
        />
        <ThemeProvider>
          <ToastProvider>
            <DialogProvider>{children}</DialogProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
