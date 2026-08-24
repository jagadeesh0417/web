"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck, ExternalLink, CheckCircle2, XCircle, RotateCcw, ChevronDown, MessageSquare,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { getSession, demoGetAllUsers } from "@/lib/auth";
import {
  getSubmissions, getAssignmentById, getModules, reviewSubmission,
} from "@/lib/data/repository";
import { demoData } from "@/lib/data/sample-data";
import { CATEGORIES } from "@/lib/constants";
import { emailTemplates, sendWorkflowEmail, pushNotification } from "@/lib/notifications";
import { cn, formatDateTime } from "@/lib/utils";
import type { Submission } from "@/lib/types";

const STATUS_LABEL: Record<Submission["status"], string> = {
  submitted: "Pending review",
  reviewed: "Reviewed",
  revision: "Changes requested",
  approved: "Approved",
};

export default function AdminAssignmentReviewPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("submitted");
  const [openId, setOpenId] = useState<string | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  const studentIndex = useMemo(() => {
    const map: Record<string, { name: string; email: string }> = {};
    for (const u of demoData.demoUsers) map[u.id] = { name: u.name, email: u.email };
    for (const u of demoGetAllUsers()) if (!map[u.id]) map[u.id] = { name: u.name, email: u.email };
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const submissions = getSubmissions();
  const pending = submissions.filter((s) => s.status === "submitted");

  const doReview = (sub: Submission, status: "approved" | "revision") => {
    if (status === "approved") {
      const g = Number(grade);
      if (!Number.isFinite(g) || g < 0 || g > 100) {
        toast("error", "Invalid grade", "Enter a grade between 0 and 100.");
        return;
      }
      if (!feedback.trim()) {
        toast("error", "Feedback required", "Write a short feedback message for the student.");
        return;
      }
    }
    setBusy(true);
    reviewSubmission(sub.id, { grade: status === "approved" ? Number(grade) : 0, feedback: feedback.trim(), status });
    const assignment = getAssignmentById(sub.assignmentId);
    const student = studentIndex[sub.studentId];
    const name = student?.name ?? "Student";
    const email = student?.email ?? "";
    const title = assignment?.title ?? "Assignment";
    const tpl = emailTemplates();
    const html = status === "approved"
      ? tpl.assignmentFeedback(name, { title, status: "Approved ✓", feedback: feedback.trim() })
      : tpl.assignmentFeedback(name, { title, status: "Changes requested", feedback: feedback.trim() });
    if (email) {
      void sendWorkflowEmail({ to: email, subject: `Assignment ${status === "approved" ? "approved" : "update"} — ${title}`, template: "assignment_feedback", html });
    }
    pushNotification(sub.studentId, status === "approved" ? "Assignment approved" : "Assignment needs changes", `Your assignment "${title}" was ${status === "approved" ? "approved — next week unlocked!" : "sent back with feedback."}`, status === "approved" ? "approval" : "general");
    setTimeout(() => {
      setBusy(false);
      setOpenId(null);
      setGrade("");
      setFeedback("");
      toast("success", status === "approved" ? "Assignment approved" : "Changes requested", status === "approved" ? "Student notified — next module is now unlocked." : "Student notified by email.");
    }, 500);
  };

  const visible = tab === "submitted" ? pending : submissions.filter((s) => s.status === tab);

  return (
    <DashboardShell requiredRoles={["admin", "super_admin", "mentor"]}>
      <PageHeader
        title="Assignment Review"
        description="Approve submissions to unlock the next week automatically. Students are notified by email."
        actions={<Badge variant="warning">{pending.length} awaiting review</Badge>}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="submitted">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="revision">Changes requested</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <EmptyState icon={<ClipboardCheck className="h-10 w-10" />} title="Nothing here" description="No submissions in this state right now." />
      ) : (
        <div className="mt-4 space-y-4">
          {visible.map((sub) => {
            const assignment = getAssignmentById(sub.assignmentId);
            const mod = assignment ? CATEGORIES.flatMap((c) => getModules(c.slug)).find((m) => m.assignmentId === assignment.id) : undefined;
            const student = studentIndex[sub.studentId];
            const isOpen = openId === sub.id;
            return (
              <Card key={sub.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar name={student?.name ?? "Student"} />
                      <div>
                        <p className="text-sm font-semibold">{student?.name ?? "Unknown student"}</p>
                        <p className="text-xs text-muted-foreground">{student?.email ?? sub.studentId}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          {mod && <Badge variant="outline">Week {mod.week}</Badge>}
                          <Badge variant={sub.status === "approved" ? "success" : sub.status === "revision" ? "warning" : "info"}>
                            {STATUS_LABEL[sub.status]}
                          </Badge>
                          {sub.grade !== undefined && sub.status === "approved" && <Badge variant="success">Grade {sub.grade}/100</Badge>}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDateTime(sub.submittedAt)}</span>
                  </div>

                  <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
                    <p className="text-sm font-semibold">{assignment?.title ?? "Assignment"}</p>
                    {sub.links[0] && (
                      <a href={sub.links[0]} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1.5 break-all font-mono text-xs text-brand-500 hover:underline">
                        <ExternalLink className="h-3 w-3" /> {sub.links[0]}
                      </a>
                    )}
                    {sub.note && (
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" /> {sub.note}
                      </p>
                    )}
                    {sub.feedback && (
                      <p className="mt-2 rounded-lg bg-background p-3 text-xs text-muted-foreground">
                        <strong className="text-foreground">Previous feedback: </strong>{sub.feedback}
                      </p>
                    )}
                  </div>

                  {sub.status !== "approved" && (
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => { setOpenId(isOpen ? null : sub.id); setGrade(String(sub.grade ?? "")); setFeedback(sub.feedback ?? ""); }}>
                        Review <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                      </Button>
                    </div>
                  )}

                  {isOpen && (
                    <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Grade (0–100)">
                          <Input type="number" min={0} max={100} value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. 85" />
                        </Field>
                        <div className="flex items-end gap-2">
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => { setFeedback(sub.links[0] ? "Please review the attached link and update your submission." : ""); }}>
                            <RotateCcw className="h-4 w-4" /> Request changes
                          </Button>
                          <Button variant="gradient" size="sm" className="flex-1" onClick={() => doReview(sub, "approved")} loading={busy}>
                            <CheckCircle2 className="h-4 w-4" /> Approve & unlock
                          </Button>
                        </div>
                      </div>
                      <Field label="Feedback (sent to student by email)">
                        <Textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What went well? What should be improved?" />
                      </Field>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => doReview(sub, "revision")} loading={busy}>
                        <XCircle className="h-4 w-4" /> Send back with feedback
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
