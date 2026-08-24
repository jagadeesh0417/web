"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, Star, RotateCcw, CheckCircle2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { getAssignments, getSubmissions, reviewSubmission } from "@/lib/data/repository";
import { formatDateTime, timeAgo } from "@/lib/utils";
import type { Submission } from "@/lib/types";

export default function MentorReviewPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const submissions = getSubmissions();
  const assignments = getAssignments();
  const nameFor = (studentId: string) => (studentId === "u_student" ? "Ananya Gupta" : studentId === "u_student2" ? "Karthik Rao" : "Intern");
  const titleFor = (assignmentId: string) => assignments.find((a) => a.id === assignmentId)?.title ?? "Assignment";

  const open = (s: Submission) => {
    setSelected(s);
    setGrade(s.grade !== undefined ? String(s.grade) : "");
    setFeedback(s.feedback ?? "");
  };

  const submitReview = (status: "approved" | "revision" | "reviewed") => {
    if (!selected) return;
    const parsedGrade = Number(grade);
    if (status !== "revision" && (Number.isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100)) {
      toast("error", "Invalid grade", "Enter a grade between 0 and 100.");
      return;
    }
    reviewSubmission(selected.id, { grade: parsedGrade, feedback: feedback.trim(), status });
    toast("success", "Review submitted", `Submission marked as ${status}.`);
    setSelected(null);
  };

  const pending = submissions.filter((s) => s.status === "submitted" || s.status === "revision");

  return (
    <DashboardShell>
      <PageHeader title="Review work" description="Grade submissions, leave feedback, approve or request changes." />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          {pending.length === 0 && <p className="text-sm text-muted-foreground">All caught up — nothing pending review.</p>}
          {pending.map((s) => (
            <button key={s.id} onClick={() => open(s)} className={`w-full rounded-xl border p-4 text-left transition-colors ${selected?.id === s.id ? "border-brand-500 bg-brand-600/5" : "border-border hover:bg-muted/50"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{titleFor(s.assignmentId)}</p>
                <Badge variant={s.status === "submitted" ? "info" : "warning"}>{s.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{nameFor(s.studentId)} · {timeAgo(s.submittedAt)}</p>
              <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{s.note ?? "No note added."}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {!selected ? (
            <Card className="flex flex-col items-center justify-center p-14 text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 font-semibold">Select a submission to review</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                New submissions and revision requests appear on the left. Grade, comment and approve or request changes.
              </p>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="primary">{selected.status}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDateTime(selected.submittedAt)}</span>
                </div>
                <CardTitle>{titleFor(selected.assignmentId)}</CardTitle>
                <CardDescription>Submitted by {nameFor(selected.studentId)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selected.links.length > 0 && (
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Links</p>
                    <div className="mt-1.5 space-y-1">
                      {selected.links.map((l) => (
                        <a key={l} href={l} target="_blank" rel="noreferrer" className="block truncate text-sm text-brand-500 hover:underline">{l}</a>
                      ))}
                    </div>
                  </div>
                )}
                {selected.files.length > 0 && (
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Files</p>
                    <div className="mt-1.5 space-y-1">
                      {selected.files.map((f) => (
                        <p key={f.name} className="text-sm">📎 {f.name} ({(f.size / 1024).toFixed(0)} KB)</p>
                      ))}
                    </div>
                  </div>
                )}
                {selected.note && (
                  <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">&ldquo;{selected.note}&rdquo;</div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={`Grade (0–100)`}>
                    <div className="relative">
                      <Star className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-9" type="number" min={0} max={100} value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="85" />
                    </div>
                  </Field>
                  <Field label="Previous feedback">
                    <Input value={selected.feedback ?? ""} disabled className="text-muted-foreground" />
                  </Field>
                </div>
                <Field label="Feedback for intern">
                  <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What went well? What should they improve?" className="min-h-[110px]" />
                </Field>

                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button variant="success" onClick={() => submitReview("approved")}>
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button variant="warning" className="text-warning" onClick={() => submitReview("revision")}>
                    <RotateCcw className="h-4 w-4" /> Request changes
                  </Button>
                  <Button variant="secondary" onClick={() => submitReview("reviewed")}>Save as reviewed</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
