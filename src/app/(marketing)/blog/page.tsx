import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { blogPosts } from "@/lib/data/sample-data";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";

export const metadata = {
  title: "Blog",
  description: "Growth insights from the Akradhii team — AI, ads, design, engineering and careers.",
};

export default function BlogPage() {
  const published = blogPosts.filter((p) => p.published);
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <Badge variant="primary" className="mb-4">The Akradhii blog</Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Ideas for growth</h1>
        <p className="mt-4 text-muted-foreground">
          Practical plays on AI, advertising, design, engineering and building a career.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {published.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.05}>
            <Link href={`/blog/${post.slug}`}>
              <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/10">
                <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${post.gradient}`}>
                  <span className="text-5xl font-black text-white/20 transition-transform group-hover:scale-110">A</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary">{post.category}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {post.readingTime} min
                    </span>
                  </div>
                  <h2 className="mt-3 font-semibold leading-snug group-hover:text-brand-500 transition-colors">{post.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
