"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen, Clock, GraduationCap, Play, RefreshCw, Search, Star, Unlock, XCircle,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress, Skeleton, Spinner } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn, formatCurrency } from "@/lib/utils";

interface Course {
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
  modules?: { _id: string; title: string; lessons: { _id: string }[] }[];
}

interface Subscription {
  _id: string;
  status: string;
  isActive: boolean;
  courseIds?: string[];
  expiryDate: string;
}

interface CourseProgress {
  courseId: string;
  completed: boolean;
  completedLessons: number;
  totalLessons: number;
}

interface ProgressData {
  ok: boolean;
  progress: CourseProgress[];
}

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-44 w-full" />
      <CardContent className="space-y-3 p-5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("enrolled");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesRes, subsRes, progressRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/subscriptions"),
        fetch("/api/course-progress"),
      ]);

      if (!coursesRes.ok) throw new Error("Failed to load courses");

      const coursesData = await coursesRes.json();
      const subsData = subsRes.ok ? await subsRes.json() : { subscriptions: [] };
      const progressData: ProgressData = progressRes.ok ? await progressRes.json() : { ok: false, progress: [] };

      setCourses(coursesData.courses ?? []);

      const activeSubs = (subsData.subscriptions ?? []).filter(
        (s: Subscription) => s.isActive,
      );
      setSubscriptions(activeSubs);

      const progressMap: Record<string, CourseProgress> = {};
      for (const p of progressData.progress ?? []) {
        progressMap[p.courseId] = p;
      }
      setProgress(progressMap);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const enrolledCourseIds = new Set(
    subscriptions.flatMap((s) => s.courseIds ?? []),
  );

  const enrolledCourses = courses.filter((c) => enrolledCourseIds.has(c._id));
  const availableCourses = courses.filter((c) => !enrolledCourseIds.has(c._id));

  const filteredEnrolled = enrolledCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredAvailable = availableCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()),
  );

  const categories = [...new Set(courses.map((c) => c.category))];

  if (loading) {
    return (
      <DashboardShell>
        <PageHeader title="My Courses" description="Your enrolled courses and learning catalog." />
        <div className="mb-6">
          <Skeleton className="h-10 w-72" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <PageHeader title="My Courses" description="Your enrolled courses and learning catalog." />
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

  const totalEnrolled = enrolledCourses.length;
  const totalCompleted = enrolledCourses.filter(
    (c) => progress[c._id]?.completed,
  ).length;

  return (
    <DashboardShell>
      <PageHeader
        title="My Courses"
        description={`${totalEnrolled} enrolled · ${totalCompleted} completed`}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
          />
        </div>
      </div>

      <Tabs defaultValue="enrolled" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="enrolled">
            <GraduationCap className="h-3.5 w-3.5" /> Enrolled ({totalEnrolled})
          </TabsTrigger>
          <TabsTrigger value="browse">
            <BookOpen className="h-3.5 w-3.5" /> Browse ({filteredAvailable.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled">
          {filteredEnrolled.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="h-10 w-10" />}
              title={search ? "No matching courses" : "No enrolled courses yet"}
              description={
                search
                  ? "Try a different search term."
                  : "Browse the catalog to find courses to enroll in."
              }
              action={
                !search ? (
                  <Button variant="gradient" size="sm" onClick={() => setActiveTab("browse")}>
                    Browse courses
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEnrolled.map((course) => {
                const p = progress[course._id];
                const percent = p
                  ? p.totalLessons > 0
                    ? Math.round((p.completedLessons / p.totalLessons) * 100)
                    : 0
                  : 0;

                return (
                  <Card key={course._id} className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-600/10">
                    <div className="relative h-44 overflow-hidden bg-muted">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
                          <BookOpen className="h-10 w-10 text-violet-400" />
                        </div>
                      )}
                      {p?.completed && (
                        <span className="absolute right-2 top-2 rounded-full bg-success/90 px-2.5 py-0.5 text-xs font-bold text-white">
                          Completed
                        </span>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="outline" className="mb-2 text-[10px]">
                        {course.category}
                      </Badge>
                      <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {course.description}
                      </p>

                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" /> {course.level}
                        </span>
                      </div>

                      {p && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {p.completedLessons}/{p.totalLessons} lessons
                            </span>
                            <span className="font-medium">{percent}%</span>
                          </div>
                          <Progress value={percent} className="mt-1.5" />
                        </div>
                      )}

                      <div className="mt-4">
                        <Link href={`/student/courses/${course._id}/learn`}>
                          <Button variant="gradient" size="sm" className="w-full">
                            <Play className="h-3.5 w-3.5 mr-1" /> Continue Learning
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse">
          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearch(cat)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground cursor-pointer hover:border-violet-500/40 hover:text-foreground transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filteredAvailable.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-10 w-10" />}
              title={search ? "No matching courses" : "No courses available"}
              description={
                search
                  ? "Try a different search term."
                  : "Check back later for new courses."
              }
            />
          ) : (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAvailable.map((course) => {
                const moduleCount = course.modules?.length ?? 0;
                const lessonCount =
                  course.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;

                return (
                  <Card key={course._id} className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-600/10">
                    <div className="relative h-44 overflow-hidden bg-muted">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-600/20 to-indigo-600/20">
                          <BookOpen className="h-10 w-10 text-violet-400" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="outline" className="mb-2 text-[10px]">
                        {course.category}
                      </Badge>
                      <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {course.description}
                      </p>

                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" /> {course.level}
                        </span>
                        <span>{moduleCount} modules · {lessonCount} lessons</span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-lg font-bold">{formatCurrency(course.price)}</p>
                        <Link href={`/student/courses/${course._id}`}>
                          <Button variant="outline" size="sm">
                            <Unlock className="h-3.5 w-3.5 mr-1" /> View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
