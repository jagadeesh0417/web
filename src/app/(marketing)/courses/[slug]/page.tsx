"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronDown, ChevronRight, Clock, FileText,
  Lock, Play, PlayCircle, Star, XCircle, RefreshCw, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Reveal } from "@/components/marketing/reveal";
import { Spinner } from "@/components/ui/progress";
import { formatCurrency, cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface Lesson {
  _id: string;
  title: string;
  type: string;
  sortOrder: number;
  duration?: number;
}

interface Module {
  _id: string;
  title: string;
  description?: string;
  sortOrder: number;
  lessons: Lesson[];
}

interface CourseDetail {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  banner: string;
  category: string;
  duration: string;
  level: string;
  price: number;
  modules: Module[];
}

export default function MarketingCourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses/${params.slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Course not found");
          return;
        }
        throw new Error("Failed to load course");
      }
      const data = await res.json();
      setCourse(data.course);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.slug) fetchData();
  }, [params.slug]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">{error ?? "Course not found"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The course you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/courses" className="mt-6">
          <Button variant="gradient">Browse courses</Button>
        </Link>
      </div>
    );
  }

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0,
  );

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Frontend Developer",
      text: "The structured curriculum and mentor feedback made a huge difference. I landed my first dev job within a month of completing the course.",
    },
    {
      name: "Rahul Verma",
      role: "UI/UX Designer",
      text: "Hands-on projects and real-world assignments — this is how learning should work. The certificate added real credibility to my portfolio.",
    },
    {
      name: "Ananya Patel",
      role: "Full Stack Developer",
      text: "Progressive unlocking kept me motivated. The mentor reviews were detailed and helped me improve every week.",
    },
  ];

  const relatedCourses = course.modules.length > 0 ? [] : [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-glow" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="primary">{course.category}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                {course.title}
              </h1>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {course.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {course.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4" /> {course.level}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" /> {course.modules.length} modules · {totalLessons} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> 300+ students enrolled
                </span>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/internships/apply">
                  <Button variant="gradient" size="lg">
                    Enroll Now <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">Sign In</Button>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
                {course.banner || course.thumbnail ? (
                  <img
                    src={course.banner || course.thumbnail}
                    alt={course.title}
                    className="w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
                    <BookOpen className="h-16 w-16 text-violet-400" />
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Content + Pricing */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Reveal>
              <h2 className="text-2xl font-bold">Course Content</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {course.modules.length} modules · {totalLessons} lessons · {course.duration}
              </p>
            </Reveal>

            <div className="mt-6 space-y-2">
              {course.modules
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((mod, idx) => {
                  const expanded = expandedModules.has(mod._id);

                  return (
                    <Reveal key={mod._id} delay={idx * 0.03}>
                      <Card>
                        <button
                          onClick={() => toggleModule(mod._id)}
                          className="flex w-full items-center gap-3 p-4 text-left"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/10 text-sm font-bold text-violet-500">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold">{mod.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {mod.lessons.length} lessons
                              {mod.description && ` · ${mod.description}`}
                            </p>
                          </div>
                          {expanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                        </button>
                        {expanded && (
                          <div className="border-t border-border px-4 pb-3 pt-2">
                            <div className="space-y-1">
                              {mod.lessons
                                .sort((a, b) => a.sortOrder - b.sortOrder)
                                .map((lesson) => (
                                  <div
                                    key={lesson._id}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
                                  >
                                    {lesson.type === "video" ? (
                                      <PlayCircle className="h-4 w-4 shrink-0 text-violet-500" />
                                    ) : (
                                      <FileText className="h-4 w-4 shrink-0 text-sky-500" />
                                    )}
                                    <span className="flex-1 truncate">{lesson.title}</span>
                                    {lesson.duration && (
                                      <span className="text-xs text-muted-foreground">
                                        {lesson.duration}m
                                      </span>
                                    )}
                                    <Lock className="h-3 w-3 text-muted-foreground/40" />
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    </Reveal>
                  );
                })}
            </div>
          </div>

          {/* Pricing Card */}
          <div>
            <Reveal delay={0.06}>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {formatCurrency(course.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">one-time</span>
                  </div>
                  <Separator className="my-4" />
                  <ul className="space-y-2.5">
                    {[
                      `${course.modules.length} modules`,
                      `${totalLessons} video lessons`,
                      `${course.duration} of content`,
                      "Mentor feedback on assignments",
                      "Certificate of completion",
                      "Lifetime access",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 space-y-2">
                    <Link href="/internships/apply" className="block">
                      <Button variant="gradient" className="w-full" size="lg">
                        Enroll Now <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                    <Link href="/login" className="block">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              What our students say
            </h2>
            <p className="mt-3 text-muted-foreground">
              Real feedback from students who completed our courses.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.06}>
                <Card className="h-full p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
                      {t.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Related Courses (placeholder) */}
      {relatedCourses.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Related courses</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Related course cards would render here */}
          </div>
        </section>
      )}

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
