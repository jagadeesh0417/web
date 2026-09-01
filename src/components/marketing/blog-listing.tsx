"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import type { BlogPost } from "@/lib/types";
import { cn } from "@/lib/utils";

const authorAvatars: Record<string, string> = {
  "Sneha Kulkarni": "/team/sneha.svg",
  "Priya Sharma": "/team/priya.svg",
  "Rahul Iyer": "/team/rahul.svg",
  "Arjun Reddy": "/team/arjun.svg",
};

export function BlogListing({ posts }: { posts: BlogPost[] }) {
  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [posts]);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query)) ||
        p.author.toLowerCase().includes(query)
      );
    });
  }, [posts, q, cat]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div>
      <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search articles…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search articles"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              cat === c
                ? "border-brand-500 bg-brand-600/15 text-brand-300"
                : "border-border text-muted-foreground hover:border-brand-500/40",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">No articles match your search.</p>
      ) : (
        <>
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="mt-12 block">
              <Card className="group overflow-hidden transition-all hover:border-brand-500/40 lg:grid lg:grid-cols-2">
                <div className={`relative flex min-h-[180px] items-center justify-center bg-gradient-to-br ${featured.gradient} lg:min-h-full`}>
                  <Image
                    src={`/blog/${featured.slug}.svg`}
                    alt={featured.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="primary">Featured</Badge>
                    <Badge variant="outline">{featured.category}</Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {featured.readingTime} min
                    </span>
                  </div>
                  <h2 className="mt-3 text-2xl font-bold leading-snug group-hover:text-brand-300">{featured.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{featured.excerpt}</p>
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar name={featured.author} src={authorAvatars[featured.author]} className="h-6 w-6 text-[10px]" />
                    {featured.author} ·{" "}
                    {new Date(featured.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Card>
            </Link>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="group h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/10">
                  <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${post.gradient}`}>
                    <Image
                      src={`/blog/${post.slug}.svg`}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <Badge variant="primary">{post.category}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {post.readingTime} min
                      </span>
                    </div>
                    <h2 className="mt-3 font-semibold leading-snug transition-colors group-hover:text-brand-400">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Avatar name={post.author} src={authorAvatars[post.author]} className="h-5 w-5 text-[9px]" />
                        {post.author}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
