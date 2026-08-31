"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2, Clock, Lock, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress, Skeleton } from "@/components/ui/progress";
import { formatDate, cn } from "@/lib/utils";

interface TimelineWeek {
  week: number;
  moduleId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  lessons: number;
  hasAssignment: boolean;
  assignmentTitle?: string;
  assignmentSubmitted: boolean;
  assignmentStatus?: string;
  status: "completed" | "current" | "upcoming" | "overdue";
  locked: boolean;
  lessonsCompleted: number;
  totalLessons: number;
}

interface TimelineData {
  weeks: TimelineWeek[];
  enrollment: Record<string, unknown>;
  percent: number;
  currentWeek: number;
}

const statusConfig = {
  completed: {
    color: "bg-success",
    lineColor: "bg-success",
    icon: CheckCircle2,
    iconColor: "text-success",
    label: "Completed",
    badgeVariant: "success" as const,
  },
  current: {
    color: "bg-violet-500",
    lineColor: "bg-violet-300",
    icon: Clock,
    iconColor: "text-violet-500",
    label: "Current Week",
    badgeVariant: "primary" as const,
  },
  upcoming: {
    color: "bg-muted-foreground",
    lineColor: "bg-border",
    icon: Clock,
    iconColor: "text-muted-foreground",
    label: "Upcoming",
    badgeVariant: "outline" as const,
  },
  overdue: {
    color: "bg-warning",
    lineColor: "bg-warning",
    icon: AlertCircle,
    iconColor: "text-warning",
    label: "Needs Revision",
    badgeVariant: "warning" as const,
  },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/timeline");
      if (!res.ok) throw new Error("Failed to load timeline");
      const json = await res.json();
      setData(json);
      const current = json.weeks.find((w: TimelineWeek) => w.status === "current");
      if (current) setExpandedWeeks(new Set([current.week]));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load timeline</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  if (!data || !data.enrollment || data.weeks.length === 0) {
    return (
      <div>
        <PageHeader title="Timeline" description="Your internship week-by-week roadmap." />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No timeline available</h3>
          <p className="text-sm text-muted-foreground">Enroll in a program to see your timeline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timeline"
        description={`${data.enrollment.programTitle} · ${data.weeks.length}-week program`}
        actions={
          <Badge variant="info" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            Week {data.currentWeek} of {data.weeks.length}
          </Badge>
        }
      />

      {/* Overall Progress */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Progress value={data.percent} className="flex-1" />
          <span className="text-sm font-bold">{data.percent}%</span>
        </div>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {data.weeks.map((week) => {
            const config = statusConfig[week.status];
            const Icon = config.icon;
            const isExpanded = expandedWeeks.has(week.week);
            const progressPercent = week.totalLessons > 0
              ? Math.round((week.lessonsCompleted / week.totalLessons) * 100)
              : 0;

            return (
              <div key={week.moduleId} className="relative pl-12">
                {/* Dot */}
                <div className={cn(
                  "absolute left-3 top-5 z-10 flex h-5 w-5 items-center justify-center rounded-full",
                  config.color,
                )}>
                  <Icon className="h-3 w-3 text-white" />
                </div>

                {/* Card */}
                <Card className={cn(
                  "transition-all",
                  week.status === "current" && "border-violet-500/30 shadow-md shadow-violet-500/10",
                  week.locked && "opacity-60",
                )}>
                  <button
                    onClick={() => !week.locked && toggleWeek(week.week)}
                    className="w-full text-left p-5"
                    disabled={week.locked}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Week {week.week}
                          </span>
                          <Badge variant={config.badgeVariant} className="text-[10px]">
                            {config.label}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{week.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {week.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {week.locked ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && !week.locked && (
                    <div className="border-t border-border px-5 pb-5 pt-3 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{formatDate(week.startDate)} — {formatDate(week.endDate)}</span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-border bg-muted/20 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Lessons</p>
                          <div className="flex items-center gap-2">
                            <Progress value={progressPercent} className="flex-1 h-1.5" />
                            <span className="text-xs font-medium">{week.lessonsCompleted}/{week.totalLessons}</span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/20 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Assignment</p>
                          {week.hasAssignment ? (
                            <div className="flex items-center gap-2">
                              {week.assignmentSubmitted ? (
                                <Badge variant={week.assignmentStatus === "approved" ? "success" : "info"} className="text-[10px]">
                                  {week.assignmentStatus}
                                </Badge>
                              ) : (
                                <Badge variant="warning" className="text-[10px]">Not submitted</Badge>
                              )}
                              <span className="text-xs truncate">{week.assignmentTitle}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No assignment</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
