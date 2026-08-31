"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, Clock, Download, FileText, ListChecks, Lock, PlayCircle, Send, Target, ExternalLink,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { SubmissionLinkType } from "@/lib/types";

const LINK_TYPES: Array<{ id: SubmissionLinkType; label: string; placeholder: string }> = [
  { id: "drive", label: "Google Drive", placeholder: "https://drive.google.com/file/d/…" },
  { id: "github", label: "GitHub", placeholder: "https://github.com/you/repo" },
  { id: "figma", label: "Figma", placeholder: "https://figma.com/file/…" },
  { id: "canva", label: "Canva", placeholder: "https://canva.com/design/…" },
  { id: "other", label: "Other", placeholder: "https://…" },
];

interface LessonData {
  id: string;
  title: string;
  duration: number;
  videoUrl?: string;
  notes: string;
  learningObjectives?: string[];
  type: string;
  completed: boolean;
}

interface ModuleData {
  id: string;
  title: string;
  week: number;
  order: number;
  description: string;
  resources: { name: string; type: string }[];
  lessons: LessonData[];
  lessonsDone: number;
  allLessonsDone: boolean;
  percent: number;
}

interface AssignmentData {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  linkTypes: SubmissionLinkType[];
}

interface SubmissionData {
  id: string;
  links: string[];
  linkType?: string;
  note?: string;
  status: string;
  grade?: number;
  feedback?: string;
  submittedAt: string;
}

interface ApiResponse {
  module: ModuleData;
  unlocked: boolean;
  lockReason?: string;
  assignment: AssignmentData | null;
  submission: SubmissionData | null;
}

export default function ModuleDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState(0);
  const [linkType, setLinkType] = useState<SubmissionLinkType>("github");
  const [link, setLink] = useState("");
  const [comment, setComment] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/student/modules/${params.id}`);
      if (!res.ok) {
        if (res.status === 404) { setData(null); return; }
        throw new Error("Failed to load module");
      }
      const json = await res.json();
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load module");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <PageHeader title="Module" description="Loading failed." />
        <Card>
          <CardContent className="flex flex-col items-center p-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>Retry</Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  if (!data) {
    return (
      <DashboardShell>
        <PageHeader title="Module not found" description="This module doesn't exist." />
      </DashboardShell>
    );
  }

  const { module: mod, unlocked, lockReason, assignment, submission } = data;

  if (!unlocked) {
    return (
      <DashboardShell>
        <PageHeader title={mod.title} description={`Week ${mod.week}`} actions={
          <Link href="/student/modules"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> All modules</Button></Link>
        } />
        <Card>
          <CardContent className="flex flex-col items-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold">This module is locked</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{lockReason}</p>
            <Link href="/student/modules" className="mt-5">
              <Button variant="gradient">Back to modules</Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  const lesson = mod.lessons[activeLesson]!;
  const lessonDone = lesson.completed;
  const { allLessonsDone } = mod;

  const handleMarkComplete = async () => {
    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      if (!res.ok) throw new Error("Failed to mark lesson");
      setData((prev) => {
        if (!prev) return prev;
        const updatedLessons = prev.module.lessons.map((l, i) =>
          i === activeLesson ? { ...l, completed: true } : l,
        );
        const done = updatedLessons.filter((l) => l.completed).length;
        return {
          ...prev,
          module: {
            ...prev.module,
            lessons: updatedLessons,
            lessonsDone: done,
            allLessonsDone: done === updatedLessons.length,
            percent: Math.round((done / updatedLessons.length) * 100),
          },
        };
      });
      setActiveLesson((i) => (i + 1 < mod.lessons.length ? i + 1 : i));
      const nowDone = mod.lessonsDone + 1;
      toast("success", "Lesson complete", nowDone === mod.lessons.length ? "All lessons done — your assignment is now unlocked!" : "Great progress. Keep going!");
    } catch {
      toast("error", "Error", "Could not mark lesson as complete. Try again.");
    }
  };

  const handleSubmitAssignment = async () => {
    if (!assignment) return;
    setSubmitError("");
    if (!link.trim()) {
      setSubmitError("Paste a link to your work first.");
      return;
    }
    try {
      new URL(/^https?:\/\//i.test(link.trim()) ? link.trim() : `https://${link.trim()}`);
    } catch {
      setSubmitError("Enter a valid URL.");
      return;
    }
    const allowed = assignment.linkTypes;
    const detectedType = inferLinkTypeLocal(link);
    if (allowed.length > 0 && !allowed.includes(detectedType)) {
      setSubmitError(`Only ${allowed.join(", ")} links are accepted.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          link: link.trim(),
          linkType: detectedType,
          comment: comment.trim() || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Submission failed");
      }
      setData((prev) => prev ? { ...prev, submission: result.submission } : prev);
      toast("success", "Assignment submitted", "Your mentor will review it shortly — approval unlocks the next week.");
      setLink("");
      setComment("");
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title={mod.title}
        description={`Week ${mod.week} · ${mod.lessonsDone}/${mod.lessons.length} lessons complete`}
        actions={
          <Link href="/student/modules"><Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> All modules</Button></Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video w-full bg-black">
                {lesson.videoUrl ? (
                  <iframe
                    src={lesson.videoUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={lesson.title}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/60">
                    <PlayCircle className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary">Lesson {activeLesson + 1} of {mod.lessons.length}</Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {lesson.duration} min</span>
                  {lessonDone && <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>}
                </div>
                <h2 className="mt-3 text-xl font-bold">{lesson.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{lesson.notes}</p>

                {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                  <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-brand-500" /> Learning objectives</p>
                    <ul className="mt-2 space-y-1.5">
                      {lesson.learningObjectives.map((o, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={activeLesson === 0} onClick={() => setActiveLesson((i) => Math.max(0, i - 1))}>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={activeLesson === mod.lessons.length - 1} onClick={() => setActiveLesson((i) => Math.min(mod.lessons.length - 1, i + 1))}>
                      Next
                    </Button>
                  </div>
                  <Button size="sm" variant={lessonDone ? "secondary" : "gradient"} onClick={handleMarkComplete}>
                    <CheckCircle2 className="h-4 w-4" /> {lessonDone ? "Lesson complete" : "Mark lesson complete"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {assignment && (
            <Card className={cn(!allLessonsDone && "opacity-70")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-brand-500" /> Week {mod.week} assignment
                </CardTitle>
                <CardDescription>
                  {allLessonsDone ? "All lessons complete — submit your work below." : `Watch all ${mod.lessons.length} lessons to unlock this assignment.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold">{assignment.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{assignment.description}</p>
                <ul className="mt-3 space-y-1.5">
                  {assignment.instructions.map((ins) => (
                    <li key={ins} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" /> {ins}
                    </li>
                  ))}
                </ul>

                {submission ? (
                  <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={submission.status === "approved" ? "success" : submission.status === "revision" ? "warning" : "info"}>
                        {submission.status === "approved" ? "Approved" : submission.status === "revision" ? "Changes requested" : "Pending review"}
                      </Badge>
                      {submission.grade !== undefined && <span className="font-bold">Grade: {submission.grade}/100</span>}
                    </div>
                    {submission.links.length > 0 && (
                      <a href={submission.links[0]} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1.5 break-all font-mono text-xs text-brand-500 hover:underline">
                        <ExternalLink className="h-3 w-3" /> {submission.links[0]}
                      </a>
                    )}
                    {submission.feedback && (
                      <p className="mt-2 rounded-lg bg-background p-3 text-xs text-muted-foreground">
                        <strong className="text-foreground">Mentor feedback: </strong>{submission.feedback}
                      </p>
                    )}
                    {submission.status !== "approved" && (
                      <Button size="sm" variant="outline" className="mt-3" onClick={() => { setLink(""); setComment(""); }}>
                        Resubmit
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className={cn("mt-5 space-y-3", !allLessonsDone && "pointer-events-none opacity-60")}>
                    <Field label="Submit your work as a link">
                      <div className="grid gap-2 sm:grid-cols-5">
                        {LINK_TYPES.map((lt) => (
                          <button
                            key={lt.id}
                            onClick={() => setLinkType(lt.id)}
                            className={cn(
                              "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                              linkType === lt.id ? "border-brand-500 bg-brand-600/5 text-brand-500" : "border-border text-muted-foreground hover:border-brand-500/40",
                              !assignment.linkTypes.includes(lt.id) && "opacity-40",
                            )}
                          >
                            {lt.label}
                          </button>
                        ))}
                      </div>
                      <div className="relative mt-2">
                        <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder={LINK_TYPES.find((l) => l.id === linkType)?.placeholder} className="pr-20 font-mono" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {inferLinkTypeLocal(link)}
                        </span>
                      </div>
                    </Field>
                    <Field label="Comment (optional)">
                      <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you build? Any notes for your mentor?" rows={2} />
                    </Field>
                    {submitError && <p className="text-xs text-destructive">{submitError}</p>}
                    <Button variant="gradient" onClick={handleSubmitAssignment} loading={submitting} disabled={!allLessonsDone}>
                      <Send className="h-4 w-4" /> Submit for review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Lessons</CardTitle>
              <CardDescription>{mod.percent}% complete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {mod.lessons.map((l, i) => {
                const done = l.completed;
                return (
                  <button
                    key={l.id}
                    onClick={() => setActiveLesson(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                      activeLesson === i ? "border-brand-500/50 bg-brand-600/5" : "border-border hover:border-brand-500/30",
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/40 text-[10px] font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                    )}
                    <span className="flex-1 truncate">{l.title}</span>
                    <span className="text-[10px] text-muted-foreground">{l.duration}m</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Resources & notes</CardTitle>
              <CardDescription>PDF notes for this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {mod.resources.map((r) => (
                <a
                  key={r.name}
                  href="#downloads"
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm transition-colors hover:border-brand-500/40"
                >
                  <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-brand-500" /> {r.name}</span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
              {mod.resources.length === 0 && <p className="text-sm text-muted-foreground">No resources for this week.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

function inferLinkTypeLocal(url: string): SubmissionLinkType {
  const v = url.trim().toLowerCase();
  if (/(drive\.google\.com|docs\.google\.com)/.test(v)) return "drive";
  if (/github\.com/.test(v)) return "github";
  if (/figma\.com/.test(v)) return "figma";
  if (/canva\.com/.test(v)) return "canva";
  return "other";
}
