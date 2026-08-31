"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, ChevronDown, ClipboardList, FileWarning, Send,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
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

interface TaskItem {
  id: string;
  moduleId: string;
  moduleTitle: string;
  week: number;
  title: string;
  description: string;
  instructions: string[];
  linkTypes: SubmissionLinkType[];
  lessonsDone: number;
  totalLessons: number;
  allLessonsDone: boolean;
  status: "not_started" | "submitted" | "approved" | "revision";
  submission: {
    id: string;
    links: string[];
    linkType?: string;
    note?: string;
    status: string;
    grade?: number;
    feedback?: string;
    submittedAt: string;
  } | null;
}

interface TasksResponse {
  tasks: TaskItem[];
  enrollment: { id: string; categorySlug: string; programTitle: string } | null;
}

export default function AssignmentsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<TasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, { linkType: SubmissionLinkType; link: string; comment: string; error: string; busy: boolean }>>({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      const json = await res.json();
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <PageHeader title="Assignments" description="Submit your weekly work as a link." />
        <div className="flex items-center justify-center py-20"><Spinner /></div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <PageHeader title="Assignments" description="Submit your weekly work as a link." />
        <Card>
          <CardContent className="flex flex-col items-center p-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchData}>Retry</Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  if (!data?.enrollment) {
    return (
      <DashboardShell>
        <PageHeader title="Assignments" description="Submit your weekly work as a link." />
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="No program yet"
          description="Enroll in an internship to unlock weekly assignments."
        />
      </DashboardShell>
    );
  }

  const submit = async (task: TaskItem) => {
    const f = form[task.id] ?? { linkType: "github" as const, link: "", comment: "", error: "", busy: false };
    const v = f.link.trim();
    if (!v) {
      setForm((s) => ({ ...s, [task.id]: { ...f, error: "Paste a link to your work first." } }));
      return;
    }
    try {
      new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    } catch {
      setForm((s) => ({ ...s, [task.id]: { ...f, error: "Enter a valid URL." } }));
      return;
    }
    const detectedType = inferType(v);
    if (task.linkTypes.length > 0 && !task.linkTypes.includes(detectedType)) {
      setForm((s) => ({ ...s, [task.id]: { ...f, error: `Only ${task.linkTypes.join(", ")} links are accepted here.` } }));
      return;
    }
    setForm((s) => ({ ...s, [task.id]: { ...f, busy: true, error: "" } }));
    try {
      const res = await fetch("/api/student/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: task.id,
          link: v,
          linkType: detectedType,
          comment: f.comment.trim() || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Submission failed");
      }
      // Update local state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === task.id
              ? {
                  ...t,
                  status: "submitted" as const,
                  submission: result.submission,
                }
              : t,
          ),
        };
      });
      setForm((s) => ({ ...s, [task.id]: { linkType: "github", link: "", comment: "", error: "", busy: false } }));
      setOpen(null);
      toast("success", "Assignment submitted", "Your mentor will review it — approval unlocks the next week.");
    } catch (e: unknown) {
      setForm((s) => ({ ...s, [task.id]: { ...f, busy: false, error: e instanceof Error ? e.message : "Submission failed" } }));
    }
  };

  return (
    <DashboardShell>
      <PageHeader title="Assignments" description="Every week has one project assignment. Submit your work as a link (Google Drive / GitHub / Figma / Canva)." />

      <div className="space-y-4">
        {data.tasks.map((task) => {
          const f = form[task.id] ?? { linkType: "github" as const, link: "", comment: "", error: "", busy: false };
          return (
            <Card key={task.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Week {task.week}</Badge>
                      {task.status === "approved" ? (
                        <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>
                      ) : task.status === "revision" ? (
                        <Badge variant="warning"><FileWarning className="h-3 w-3" /> Changes requested</Badge>
                      ) : task.status === "submitted" ? (
                        <Badge variant="info">In review</Badge>
                      ) : (
                        <Badge variant="outline">Not submitted</Badge>
                      )}
                    </div>
                    <h3 className="mt-2 font-semibold">{task.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
                    {task.submission?.feedback && (
                      <p className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                        <strong className="text-foreground">Mentor feedback: </strong>{task.submission.feedback}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`/student/modules/${task.moduleId}`}>
                      <Button variant="outline" size="sm">Open module</Button>
                    </Link>
                    {task.status !== "approved" && (
                      <Button
                        variant={task.submission ? "outline" : "gradient"}
                        size="sm"
                        onClick={() => setOpen(open === task.id ? null : task.id)}
                      >
                        {task.submission ? "Resubmit" : "Submit work"}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", open === task.id && "rotate-180")} />
                      </Button>
                    )}
                  </div>
                </div>

                {open === task.id && task.status !== "approved" && (
                  <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Accepted formats: {task.linkTypes.join(" · ")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {LINK_TYPES.filter((lt) => task.linkTypes.includes(lt.id)).map((lt) => (
                        <button
                          key={lt.id}
                          onClick={() => setForm((s) => ({ ...s, [task.id]: { ...f, linkType: lt.id } }))}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                            f.linkType === lt.id ? "border-brand-500 bg-brand-600/5 text-brand-500" : "border-border text-muted-foreground hover:border-brand-500/40",
                          )}
                        >
                          {lt.label}
                        </button>
                      ))}
                    </div>
                    <Field label="Work link">
                      <Input
                        value={f.link}
                        onChange={(e) => setForm((s) => ({ ...s, [task.id]: { ...f, link: e.target.value, error: "" } }))}
                        placeholder={LINK_TYPES.find((lt) => lt.id === f.linkType)?.placeholder}
                        className="font-mono"
                      />
                    </Field>
                    <Field label="Comment (optional)">
                      <Textarea
                        value={f.comment}
                        onChange={(e) => setForm((s) => ({ ...s, [task.id]: { ...f, comment: e.target.value } }))}
                        placeholder="What did you build? Anything you'd like reviewed?"
                        rows={2}
                      />
                    </Field>
                    {f.error && <p className="text-xs text-destructive">{f.error}</p>}
                    <Button variant="gradient" size="sm" onClick={() => submit(task)} loading={f.busy}>
                      <Send className="h-4 w-4" /> Submit for review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {data.tasks.length === 0 && (
          <EmptyState
            icon={<ClipboardList className="h-10 w-10" />}
            title="No assignments yet"
            description="Assignments will appear here as you progress through modules."
          />
        )}
      </div>
    </DashboardShell>
  );
}

function inferType(url: string): SubmissionLinkType {
  const v = url.trim().toLowerCase();
  if (/(drive\.google\.com|docs\.google\.com)/.test(v)) return "drive";
  if (/github\.com/.test(v)) return "github";
  if (/figma\.com/.test(v)) return "figma";
  if (/canva\.com/.test(v)) return "canva";
  return "other";
}
