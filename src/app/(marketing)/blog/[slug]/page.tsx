import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { blogPosts } from "@/lib/data/sample-data";
import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyLinkButton } from "@/components/marketing/copy-link-button";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Article not found" };
  return {
    title: `${post.title} Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${siteConfig.url}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: `${siteConfig.url}/og-default.svg`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [`${siteConfig.url}/og-default.svg`],
    },
    alternates: { canonical: `${siteConfig.url}/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = blogPosts
    .filter((p) => p.published && p.slug !== post.slug && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Person", name: post.author },
    datePublished: post.publishedAt,
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Button variant="ghost" size="sm" className="mb-6">
        <Link href="/blog" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>
      </Button>

      <Badge variant="primary">{post.category}</Badge>
      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
      <div className="mt-5 flex items-center gap-3 border-b border-border pb-6">
        <Avatar name={post.author} />
        <div>
          <p className="text-sm font-semibold">{post.author}</p>
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {post.readingTime} min read
            </span>
          </p>
        </div>
      </div>

      <div className={`relative mt-8 h-48 overflow-hidden rounded-2xl bg-gradient-to-br ${post.gradient} sm:h-56`}>
        <Image
          src={`/blog/${post.slug}.svg`}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 768px"
        />
      </div>

      <article className="mt-8 space-y-5">
        {post.content.map((para, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "text-lg font-medium leading-relaxed text-foreground"
                : "leading-relaxed text-muted-foreground"
            }
          >
            {para}
          </p>
        ))}
      </article>

      <div className="mt-8 flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <Badge key={t} variant="outline">
            #{t}
          </Badge>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <p className="text-sm font-medium">Found this useful? Share it.</p>
        <CopyLinkButton />
      </div>

      <Card className="mt-8 bg-gradient-to-br from-violet-700/40 to-indigo-700/40 p-6">
        <h2 className="text-lg font-bold">Need help putting this into practice?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Talk to Akradhii about services or internship programs that match this topic.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="gradient" size="sm">
            <Link href="/contact">Contact us</Link>
          </Button>
          <Button variant="outline" size="sm">
            <Link href="/services">Explore services</Link>
          </Button>
        </div>
      </Card>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-xl font-bold">Related articles</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} href={`/blog/${r.slug}`}>
                <Card className="h-full p-4 transition-colors hover:border-brand-500/40">
                  <Badge variant="outline">{r.category}</Badge>
                  <p className="mt-2 text-sm font-semibold leading-snug">{r.title}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-brand-400">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
