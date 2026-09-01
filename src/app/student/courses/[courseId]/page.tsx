"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronRight, Clock, FileText,
  Lock, Play, PlayCircle, Star, Unlock, XCircle, RefreshCw,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Lesson {
  _id: string;
  title: string;
  type: string;
  sortOrder: number;
  duration?: number;
  status?: string;
}

interface Module {
  _id: string;
  title: string;
  description?: string;
  sortOrder: number;
  lessons: Lesson[];
  status?: string;
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
  status: string;
  modules: Module[];
  createdAt?: string;
}

interface AccessData {
  ok: boolean;
  hasAccess: boolean;
  accessType?: string;
  expiresAt?: string | null;
  reason?: string;
}

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [access, setAccess] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseRes, accessRes] = await Promise.all([
        fetch(`/api/courses/${params.courseId}`),
        fetch(`/api/course-access?courseId=${params.courseId}`),
      ]);

      if (!courseRes.ok) {
        if (courseRes.status === 404) {
          setError("Course not found");
          return;
        }
        throw new Error("Failed to load course");
      }

      const courseData = await courseRes.json();
      setCourse(courseData.course);

      const accessData: AccessData = accessRes.ok
        ? await accessRes.json()
        : { ok: false, hasAccess: false };
      setAccess(accessData);

      if (courseData.course?.modules?.length > 0) {
        setExpandedModules(new Set([courseData.course.modules[0]._id]));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.courseId) fetchData();
  }, [params.courseId]);

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
      <DashboardShell>
        <div className="flex items-center justify-center py-20"><Spinner /></div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <PageHeader title="Course" description="Loading failed." />
        <Card>
          <CardContent className="flex flex-col items-center p-12 text-center">
            <XCircle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-sm font-medium">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  if (!course) return null;

  const totalLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.status !== "ARCHIVED").length,
    0,
  );

  return (
    <DashboardShell>
      <PageHeader
        title={course.title}
        description={course.description}
        actions={
          <Link href="/student/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> All courses
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Course Hero */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video w-full bg-muted">
              {course.banner || course.thumbnail ? (
                <img
                  src={course.banner || course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
                  <BookOpen className="h-16 w-16 text-violet-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="info">{course.category}</Badge>
                  <Badge variant="default" className="bg-white/20 text-white">{course.level}</Badge>
                </div>
                <h1 className="text-2xl font-bold">{course.title}</h1>
              </div>
            </div>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {course.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4" /> {course.level}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" /> {course.modules.length} modules · {totalLessons} lessons
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </CardContent>
          </Card>

          {/* Modules */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Course Content</h2>
            <div className="space-y-2">
              {course.modules
                .filter((m) => m.status !== "ARCHIVED")
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((mod, idx) => {
                  const expanded = expandedModules.has(mod._id);
                  const activeLessons = mod.lessons.filter(
                    (l) => l.status !== "ARCHIVED",
                  );

                  return (
                    <Card key={mod._id}>
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
                            {activeLessons.length} lessons
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
                          {mod.description && (
                            <p className="mb-3 text-sm text-muted-foreground">
                              {mod.description}
                            </p>
                          )}
                          <div className="space-y-1">
                            {activeLessons
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
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="sticky top-20">
            <CardContent className="p-5">
              {access?.hasAccess ? (
                <>
                  <div className="flex items-center gap-2 text-success">
                    <Unlock className="h-5 w-5" />
                    <span className="font-semibold">You have access</span>
                  </div>
                  {access.accessType && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Via {access.accessType === "SUBSCRIPTION" ? "subscription" : "direct access"}
                    </p>
                  )}
                  <Link href={`/student/courses/${course._id}/learn`} className="mt-4 block">
                    <Button variant="gradient" className="w-full" size="lg">
                      <Play className="h-4 w-4 mr-1.5" /> Start Learning
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                    <span className="font-semibold">Enroll to access</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Purchase this course or subscribe to unlock all content.
                  </p>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(course.price)}
                    </p>
                  </div>
                  <Link href="/internships/apply" className="mt-4 block">
                    <Button variant="gradient" className="w-full" size="lg">
                      Purchase Course
                    </Button>
                  </Link>
                  <Link href="/login" className="mt-2 block">
                    <Button variant="outline" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-sm">Course Info</h3>
              <div className="space-y-2">
                {[
                  { label: "Category", value: course.category },
                  { label: "Duration", value: course.duration },
                  { label: "Level", value: course.level },
                  { label: "Modules", value: `${course.modules.length}` },
                  { label: "Lessons", value: `${totalLessons}` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
