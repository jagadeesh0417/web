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
import { getSession } from "@/lib/auth";
import {
  getStudentProgress, getAssignmentApproved, getSubmissionByAssignment,
  getModules, getAssignmentById, submitAssignment,
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

export default function AssignmentsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, { linkType: SubmissionLinkType; link: string; comment: string; error: string; busy: boolean }>>({});

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const p = getStudentProgress(user.id);
  if (!p.enrollment) {
    return (
      <DashboardShell>
        <PageHeader title="Assignments" description="Submit your weekly work as a link." />
        <EmptyState icon={<ClipboardList className="h-10 w-10" />} title="No program yet" description="Enroll in an internship to unlock weekly assignments." />
      </DashboardShell>
    );
  }

  const rows = getModules(p.enrollment.categorySlug).map((m) => ({
    module: m,
    assignment: m.assignmentId ? getAssignmentById(m.assignmentId) : undefined,
    submission: m.assignmentId ? getSubmissionByAssignment(m.assignmentId, user.id) : undefined,
    approved: m.assignmentId ? getAssignmentApproved(m.assignmentId, user.id) : true,
  }));

  const submit = (assignmentId: string) => {
    const f = form[assignmentId] ?? { linkType: "github" as const, link: "", comment: "", error: "", busy: false };
    const assignment = getAssignmentById(assignmentId)!;
    const v = f.link.trim();
    if (!v) {
      setForm((s) => ({ ...s, [assignmentId]: { ...f, error: "Paste a link to your work first." } }));
      return;
    }
    const err = validateLink(v, assignment.linkTypes);
    if (err) {
      setForm((s) => ({ ...s, [assignmentId]: { ...f, error: err } }));
      return;
    }
    setForm((s) => ({ ...s, [assignmentId]: { ...f, busy: true, error: "" } }));
    submitAssignment({
      assignmentId,
      studentId: user.id,
      links: [v],
      linkType: f.linkType,
      files: [],
      note: f.comment.trim() || undefined,
    });
    setTimeout(() => {
      setForm((s) => ({ ...s, [assignmentId]: { linkType: "github", link: "", comment: "", error: "", busy: false } }));
      setOpen(null);
      toast("success", "Assignment submitted", "Your mentor will review it — approval unlocks the next week.");
    }, 500);
  };

  return (
    <DashboardShell>
      <PageHeader title="Assignments" description="Every week has one project assignment. Submit your work as a link (Google Drive / GitHub / Figma / Canva)." />

      <div className="space-y-4">
        {rows.map(({ module, assignment, submission, approved }) => {
          const f = form[assignment?.id ?? ""] ?? { linkType: "github" as const, link: "", comment: "", error: "", busy: false };
          if (!assignment) return null;
          return (
            <Card key={assignment.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">Week {module.week}</Badge>
                      {approved ? (
                        <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>
                      ) : submission?.status === "revision" ? (
                        <Badge variant="warning"><FileWarning className="h-3 w-3" /> Changes requested</Badge>
                      ) : submission ? (
                        <Badge variant="info">In review</Badge>
                      ) : (
                        <Badge variant="outline">Not submitted</Badge>
                      )}
                    </div>
                    <h3 className="mt-2 font-semibold">{assignment.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{assignment.description}</p>
                    {submission?.feedback && (
                      <p className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                        <strong className="text-foreground">Mentor feedback: </strong>{submission.feedback}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {module.assignmentId && (
                      <Link href={`/student/modules/${module.id}`}>
                        <Button variant="outline" size="sm">Open module</Button>
                      </Link>
                    )}
                    {!approved && (
                      <Button
                        variant={submission ? "outline" : "gradient"}
                        size="sm"
                        onClick={() => setOpen(open === assignment.id ? null : assignment.id)}
                      >
                        {submission ? "Resubmit" : "Submit work"}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", open === assignment.id && "rotate-180")} />
                      </Button>
                    )}
                  </div>
                </div>

                {open === assignment.id && !approved && (
                  <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Accepted formats: {assignment.linkTypes.join(" · ")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {LINK_TYPES.filter((lt) => assignment.linkTypes.includes(lt.id)).map((lt) => (
                        <button
                          key={lt.id}
                          onClick={() => setForm((s) => ({ ...s, [assignment.id]: { ...f, linkType: lt.id } }))}
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
                        onChange={(e) => setForm((s) => ({ ...s, [assignment.id]: { ...f, link: e.target.value, error: "" } }))}
                        placeholder={LINK_TYPES.find((lt) => lt.id === f.linkType)?.placeholder}
                        className="font-mono"
                      />
                    </Field>
                    <Field label="Comment (optional)">
                      <Textarea
                        value={f.comment}
                        onChange={(e) => setForm((s) => ({ ...s, [assignment.id]: { ...f, comment: e.target.value } }))}
                        placeholder="What did you build? Anything you'd like reviewed?"
                        rows={2}
                      />
                    </Field>
                    {f.error && <p className="text-xs text-destructive">{f.error}</p>}
                    <Button variant="gradient" size="sm" onClick={() => submit(assignment.id)} loading={f.busy}>
                      <Send className="h-4 w-4" /> Submit for review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}

function validateLink(url: string, allowed: string[]): string | null {
  const v = url.trim();
  try {
    const parsed = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!["https:", "http:"].includes(parsed.protocol)) return "Only http(s) links are allowed.";
  } catch {
    return "Enter a valid URL.";
  }
  const type = inferType(v);
  if (allowed.length > 0 && !allowed.includes(type)) return `Only ${allowed.join(", ")} links are accepted here.`;
  return null;
}

function inferType(url: string): SubmissionLinkType {
  const v = url.trim().toLowerCase();
  if (/(drive\.google\.com|docs\.google\.com)/.test(v)) return "drive";
  if (/github\.com/.test(v)) return "github";
  if (/figma\.com/.test(v)) return "figma";
  if (/canva\.com/.test(v)) return "canva";
  return "other";
}
