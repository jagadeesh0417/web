"use client";

import { useEffect, useState } from "react";
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
import { getSession } from "@/lib/auth";
import {
  getModuleById, isModuleUnlocked, isLessonComplete, markLessonComplete,
  getAssignmentById, getSubmissionByAssignment, submitAssignment,
} from "@/lib/data/repository";
import { cn } from "@/lib/utils";
import type { AppUser, SubmissionLinkType } from "@/lib/types";

const LINK_TYPES: Array<{ id: SubmissionLinkType; label: string; placeholder: string }> = [
  { id: "drive", label: "Google Drive", placeholder: "https://drive.google.com/file/d/…" },
  { id: "github", label: "GitHub", placeholder: "https://github.com/you/repo" },
  { id: "figma", label: "Figma", placeholder: "https://figma.com/file/…" },
  { id: "canva", label: "Canva", placeholder: "https://canva.com/design/…" },
  { id: "other", label: "Other", placeholder: "https://…" },
];

export default function ModuleDetailPage() {
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [activeLesson, setActiveLesson] = useState(0);
  const [linkType, setLinkType] = useState<SubmissionLinkType>("github");
  const [link, setLink] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const mod = getModuleById(params.id);
  if (!mod) {
    return (
      <DashboardShell>
        <PageHeader title="Module not found" description="This module doesn't exist." />
      </DashboardShell>
    );
  }

  const lock = isModuleUnlocked(user.id, mod);
  const lessonsDone = mod.lessons.filter((l) => isLessonComplete(user.id, l.id)).length;
  const allLessonsDone = lessonsDone === mod.lessons.length;
  const assignment = mod.assignmentId ? getAssignmentById(mod.assignmentId) : undefined;
  const submission = assignment ? getSubmissionByAssignment(assignment.id, user.id) : undefined;

  if (!lock.unlocked) {
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
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{lock.reason}</p>
            <Link href="/student/modules" className="mt-5">
              <Button variant="gradient">Back to modules</Button>
            </Link>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  const lesson = mod.lessons[activeLesson]!;
  const lessonDone = isLessonComplete(user.id, lesson.id);
  const modulePercent = Math.round((lessonsDone / mod.lessons.length) * 100);

  const handleMarkComplete = () => {
    markLessonComplete(user.id, lesson.id);
    setActiveLesson((i) => (i + 1 < mod.lessons.length ? i + 1 : i));
    toast("success", "Lesson complete", allLessonsDone ? "All lessons done — your assignment is now unlocked!" : "Great progress. Keep going!");
  };

  const handleSubmitAssignment = () => {
    if (!assignment) return;
    setError("");
    const allowed = assignment.linkTypes;
    if (!link.trim()) {
      setError("Paste a link to your work first.");
      return;
    }
    const validation = validateWorkLinkLocal(link, allowed);
    if (validation) {
      setError(validation);
      return;
    }
    setSubmitting(true);
    submitAssignment({
      assignmentId: assignment.id,
      studentId: user.id,
      links: [link.trim()],
      linkType: inferLinkTypeLocal(link),
      files: [],
      note: comment.trim() || undefined,
    });
    setTimeout(() => {
      setSubmitting(false);
      toast("success", "Assignment submitted", "Your mentor will review it shortly — approval unlocks the next week.");
      setLink("");
      setComment("");
    }, 500);
  };

  return (
    <DashboardShell>
      <PageHeader
        title={mod.title}
        description={`Week ${mod.week} · ${lessonsDone}/${mod.lessons.length} lessons complete`}
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
                    {error && <p className="text-xs text-destructive">{error}</p>}
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
              <CardDescription>{modulePercent}% complete</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {mod.lessons.map((l, i) => {
                const done = isLessonComplete(user.id, l.id);
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

function validateWorkLinkLocal(url: string, allowed: string[]): string | null {
  const v = url.trim();
  if (!v) return "Paste a link to your work";
  try {
    const parsed = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!["https:", "http:"].includes(parsed.protocol)) return "Only http(s) links are allowed";
  } catch {
    return "Enter a valid URL";
  }
  const type = inferLinkTypeLocal(v);
  if (allowed.length > 0 && !allowed.includes(type)) {
    return `Only ${allowed.join(", ")} links are accepted for this assignment.`;
  }
  return null;
}
