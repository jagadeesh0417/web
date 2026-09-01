import type { Metadata } from "next";
import { blogPosts } from "@/lib/data/sample-data";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/marketing/reveal";
import { BlogListing } from "@/components/marketing/blog-listing";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Growth insights from the Akradhii team — AI, Meta Ads, design, engineering and careers.",
  openGraph: {
    title: "Blog",
    description: "Practical plays on AI, advertising, design, engineering and building a career.",
    url: `${siteConfig.url}/blog`,
    images: [
      {
        url: `${siteConfig.url}/og-default.svg`,
        width: 1200,
        height: 630,
        alt: "Akradhii Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${siteConfig.url}/og-default.svg`],
  },
  alternates: { canonical: `${siteConfig.url}/blog` },
};

export default function BlogPage() {
  const published = blogPosts
    .filter((p) => p.published)
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge variant="primary" className="mb-4">The Akradhii blog</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Ideas for growth</h1>
        <p className="mt-4 text-muted-foreground">
          Practical plays on AI, advertising, design, engineering and building a career.
        </p>
      </Reveal>

      <div className="mt-10">
        <BlogListing posts={published} />
      </div>
    </div>
  );
}
