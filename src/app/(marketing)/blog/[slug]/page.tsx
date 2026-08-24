import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { blogPosts } from "@/lib/data/sample-data";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CopyLinkButton } from "@/components/marketing/copy-link-button";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
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
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readingTime} min read</span>
          </p>
        </div>
      </div>

      <div className={`mt-8 flex h-48 items-center justify-center rounded-2xl bg-gradient-to-br ${post.gradient}`}>
        <span className="text-7xl font-black text-white/20">A</span>
      </div>

      <article className="mt-8 space-y-5">
        {post.content.map((para, i) => (
          <p key={i} className={i === 0 ? "text-lg font-medium leading-relaxed text-foreground" : "leading-relaxed text-muted-foreground"}>
            {para}
          </p>
        ))}
      </article>

      <div className="mt-8 flex flex-wrap gap-2">
        {post.tags.map((t) => (
          <Badge key={t} variant="outline">#{t}</Badge>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-medium">Found this useful? Share it.</p>
        <CopyLinkButton />
      </div>
    </div>
  );
}
