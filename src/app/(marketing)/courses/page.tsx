"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen, Clock, GraduationCap, Search, Star, XCircle, RefreshCw, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/marketing/reveal";
import { Spinner } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: string;
  duration: string;
  level: string;
  price: number;
  modules?: { _id: string; lessons: { _id: string }[] }[];
}

export default function MarketingCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to load courses");
      const data = await res.json();
      setCourses(data.courses ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categories = [...new Set(courses.map((c) => c.category))];

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" className="mb-4">
              <GraduationCap className="h-3 w-3" /> Course Catalog
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Learn skills that{" "}
              <span className="text-gradient">actually matter</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Browse {courses.length} professional courses designed to build real-world skills.
              Enroll and start learning today.
            </p>
            <div className="mx-auto mt-8 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="border-b border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  !activeCategory
                    ? "bg-violet-600 text-white"
                    : "border border-border bg-card text-muted-foreground hover:border-violet-500/40 hover:text-foreground"
                }`}
              >
                All Courses
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-violet-600 text-white"
                      : "border border-border bg-card text-muted-foreground hover:border-violet-500/40 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 text-center">
            <XCircle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-sm font-medium">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No courses found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course, i) => {
              const moduleCount = course.modules?.length ?? 0;
              const lessonCount =
                course.modules?.reduce(
                  (acc, m) => acc + (m.lessons?.length ?? 0),
                  0,
                ) ?? 0;

              return (
                <Reveal key={course._id} delay={i * 0.04}>
                  <Card className="group flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-600/10">
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
                          <BookOpen className="h-12 w-12 text-violet-400" />
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                        {course.category}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg font-bold line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" /> {course.level}
                        </span>
                        <span>
                          {moduleCount} modules · {lessonCount} lessons
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <p className="text-xl font-bold">
                          {formatCurrency(course.price)}
                        </p>
                        <Link href={`/courses/${course.slug}`}>
                          <Button variant="outline" size="sm">
                            View Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <Card className="bg-gradient-to-br from-violet-700 to-indigo-700 p-10 text-center text-white">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Ready to start learning?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-white/85">
                Join {siteConfig.name} and get access to all courses, mentorship and a
                certificate of completion.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-white text-violet-800 hover:bg-white/90"
                >
                  <Link href="/internships/apply" className="flex items-center gap-2">
                    Enroll now <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
