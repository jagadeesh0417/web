"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, FileText,
  Loader2, Lock, Play, PlayCircle, XCircle, RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress, Spinner } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Lesson {
  _id: string;
  title: string;
  type: string;
  sortOrder: number;
  duration?: number;
  videoUrl?: string;
  pdfUrl?: string;
  notes?: string;
}

interface Module {
  _id: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
}

interface CourseData {
  _id: string;
  title: string;
  slug: string;
  modules: Module[];
}

interface AccessData {
  ok: boolean;
  hasAccess: boolean;
}

interface ProgressEntry {
  _id: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  completed: boolean;
}

interface ProgressResponse {
  ok: boolean;
  progress: ProgressEntry[];
}

export default function CourseLearnPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [access, setAccess] = useState<AccessData | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);

  const allLessons = course?.modules
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((m) =>
      m.lessons
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((l) => ({ ...l, moduleId: m._id, moduleTitle: m.title })),
    ) ?? [];

  const currentLesson = allLessons[activeLessonIdx];

  const completedCount = allLessons.filter((l) => progress[l._id]).length;
  const totalLessons = allLessons.length;
  const overallPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseRes, accessRes, progressRes] = await Promise.all([
        fetch(`/api/courses/${params.courseId}`),
        fetch(`/api/course-access?courseId=${params.courseId}`),
        fetch(`/api/course-progress?courseId=${params.courseId}`),
      ]);

      if (!courseRes.ok) {
        if (courseRes.status === 404) {
          router.replace("/student/courses");
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

      if (!accessData.hasAccess) return;

      const progressData: ProgressResponse = progressRes.ok
        ? await progressRes.json()
        : { ok: false, progress: [] };

      const progressMap: Record<string, boolean> = {};
      for (const p of progressData.progress ?? []) {
        if (p.completed) progressMap[p.lessonId] = true;
      }
      setProgress(progressMap);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load course");
    } finally {
      setLoading(false);
    }
  }, [params.courseId, router]);

  useEffect(() => {
    if (params.courseId) fetchData();
  }, [params.courseId, fetchData]);

  const handleMarkComplete = async () => {
    if (!currentLesson || markingComplete) return;
    setMarkingComplete(true);
    try {
      const res = await fetch("/api/course-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: params.courseId,
          moduleId: currentLesson.moduleId,
          lessonId: currentLesson._id,
          completed: true,
        }),
      });
      if (res.ok) {
        setProgress((prev) => ({ ...prev, [currentLesson._id]: true }));
        if (activeLessonIdx < allLessons.length - 1) {
          setActiveLessonIdx((i) => i + 1);
        }
      }
    } catch {
      // silent fail
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <XCircle className="h-10 w-10 text-destructive mb-3" />
            <p className="text-sm font-medium">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course || !access) return null;

  if (!access.hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-bold">Access Required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You need an active subscription or purchase to access this course.
            </p>
            <div className="mt-6 flex gap-2">
              <Link href="/internships/apply">
                <Button variant="gradient">Enroll Now</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (allLessons.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-bold">No Lessons Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This course doesn&apos;t have any lessons yet. Check back later.
            </p>
            <Link href="/student/courses" className="mt-5">
              <Button variant="gradient">Back to Courses</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lesson = currentLesson;
  const lessonCompleted = progress[lesson._id] ?? false;

  const groupedModules = course.modules
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => ({
      ...m,
      lessons: m.lessons.sort((a, b) => a.sortOrder - b.sortOrder),
    }));

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top progress bar */}
      <div className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link
            href={`/student/courses/${params.courseId}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{course.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {completedCount}/{totalLessons} lessons · {overallPercent}% complete
            </p>
          </div>
          <div className="hidden w-48 sm:block">
            <Progress value={overallPercent} />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar - Module/Lesson Navigation */}
        <aside className="hidden w-80 shrink-0 border-r border-border lg:block">
          <ScrollArea className="h-full">
            <div className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Course Content
              </h3>
              <div className="space-y-3">
                {groupedModules.map((mod, modIdx) => {
                  const modCompleted = mod.lessons.every((l) => progress[l._id]);
                  const modLessonsDone = mod.lessons.filter((l) => progress[l._id]).length;

                  return (
                    <div key={mod._id}>
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-violet-600/10 text-[10px] font-bold text-violet-500">
                          {modIdx + 1}
                        </span>
                        <span className="text-xs font-semibold truncate">{mod.title}</span>
                        {modCompleted && (
                          <CheckCircle2 className="ml-auto h-3.5 w-3.5 shrink-0 text-success" />
                        )}
                      </div>
                      <div className="ml-2.5 space-y-0.5 border-l border-border pl-3">
                        {mod.lessons.map((l, lIdx) => {
                          const globalIdx = allLessons.findIndex((al) => al._id === l._id);
                          const isActive = globalIdx === activeLessonIdx;
                          const done = progress[l._id] ?? false;

                          return (
                            <button
                              key={l._id}
                              onClick={() => setActiveLessonIdx(globalIdx)}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors",
                                isActive
                                  ? "bg-violet-600/10 text-violet-500 font-medium"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              {done ? (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                              ) : l.type === "video" ? (
                                <PlayCircle className="h-3.5 w-3.5 shrink-0" />
                              ) : (
                                <FileText className="h-3.5 w-3.5 shrink-0" />
                              )}
                              <span className="flex-1 truncate">{l.title}</span>
                              {l.duration && (
                                <span className="shrink-0 text-[10px]">{l.duration}m</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Video / PDF Player */}
          <div className="relative w-full bg-black">
            {lesson.type === "video" ? (
              <div className="aspect-video w-full">
                {lesson.videoUrl ? (
                  <video
                    key={lesson._id}
                    src={lesson.videoUrl}
                    controls
                    className="h-full w-full"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex h-full items-center justify-center text-white/40">
                    <div className="text-center">
                      <PlayCircle className="mx-auto h-16 w-16" />
                      <p className="mt-3 text-sm">Video not available</p>
                    </div>
                  </div>
                )}
              </div>
            ) : lesson.type === "pdf" ? (
              <div className="aspect-video w-full">
                {lesson.pdfUrl ? (
                  <iframe
                    src={lesson.pdfUrl}
                    className="h-full w-full border-0"
                    title={lesson.title}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/40">
                    <div className="text-center">
                      <FileText className="mx-auto h-16 w-16" />
                      <p className="mt-3 text-sm">PDF not available</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video w-full">
                <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                  <div className="text-center">
                    <BookOpen className="mx-auto h-16 w-16" />
                    <p className="mt-3 text-sm">Content type not supported</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Info + Controls */}
          <div className="flex-1 p-5 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="primary">
                  Lesson {activeLessonIdx + 1} of {totalLessons}
                </Badge>
                {lessonCompleted && (
                  <Badge variant="success">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </Badge>
                )}
                {lesson.duration && (
                  <span className="text-xs text-muted-foreground">
                    {lesson.duration} min
                  </span>
                )}
              </div>

              <h1 className="text-xl font-bold sm:text-2xl">{lesson.title}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Module: {lesson.moduleTitle}
              </p>

              {lesson.notes && (
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {lesson.notes}
                </p>
              )}

              {/* Mobile lesson list */}
              <div className="mt-6 lg:hidden">
                <h3 className="mb-2 text-sm font-semibold">Lessons</h3>
                <div className="space-y-1">
                  {allLessons.map((l, i) => {
                    const done = progress[l._id] ?? false;
                    return (
                      <button
                        key={l._id}
                        onClick={() => setActiveLessonIdx(i)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                          i === activeLessonIdx
                            ? "border-violet-500/50 bg-violet-600/5"
                            : "border-border hover:border-violet-500/30",
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                        ) : (
                          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/40 text-[9px] font-bold text-muted-foreground">
                            {i + 1}
                          </span>
                        )}
                        <span className="flex-1 truncate">{l.title}</span>
                        <span className="text-[10px] text-muted-foreground">{l.duration}m</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeLessonIdx === 0}
                    onClick={() => setActiveLessonIdx((i) => Math.max(0, i - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeLessonIdx >= allLessons.length - 1}
                    onClick={() =>
                      setActiveLessonIdx((i) => Math.min(allLessons.length - 1, i + 1))
                    }
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant={lessonCompleted ? "secondary" : "gradient"}
                  size="sm"
                  disabled={lessonCompleted || markingComplete}
                  onClick={handleMarkComplete}
                >
                  {markingComplete ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                  )}
                  {lessonCompleted ? "Completed" : "Mark Complete"}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
