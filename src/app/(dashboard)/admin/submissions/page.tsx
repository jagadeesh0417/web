"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search, Inbox, ExternalLink, ChevronDown,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

interface SubmissionRow {
  id: string;
  assignmentId: string;
  studentId: string;
  links: string[];
  linkType?: string;
  files: { name: string; size: number; type: string }[];
  note?: string;
  status: "submitted" | "reviewed" | "revision" | "approved";
  grade?: number;
  feedback?: string;
  submittedAt: string;
  reviewedAt?: string;
  studentName: string;
  studentEmail: string;
  taskTitle: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "revision", label: "Revision Requested" },
  { value: "reviewed", label: "Reviewed" },
];

const TYPE_LABEL: Record<string, string> = {
  drive: "Drive Link",
  github: "GitHub",
  figma: "Figma",
  canva: "Canva",
  other: "Link",
};

const STATUS_BADGE: Record<string, { variant: "info" | "success" | "warning" | "outline"; label: string }> = {
  submitted: { variant: "info", label: "Pending" },
  approved: { variant: "success", label: "Approved" },
  revision: { variant: "warning", label: "Revision" },
  reviewed: { variant: "outline", label: "Reviewed" },
};

export default function AdminSubmissionsPage() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "revision" | "rejected">("approved");
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/submissions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data: SubmissionRow[] = await res.json();
      setSubmissions(data);
    } catch {
      toast("error", "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const visible = useMemo(() => {
    if (!debouncedSearch.trim()) return submissions;
    const q = debouncedSearch.toLowerCase();
    return submissions.filter(
      (s) => s.studentName.toLowerCase().includes(q) || s.studentEmail.toLowerCase().includes(q),
    );
  }, [submissions, debouncedSearch]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { submitted: 0, approved: 0, revision: 0, reviewed: 0 };
    for (const s of submissions) {
      if (s.status in c) c[s.status]++;
    }
    return c;
  }, [submissions]);

  const openReview = (sub: SubmissionRow) => {
    setReviewingId(reviewingId === sub.id ? null : sub.id);
    setReviewStatus("approved");
    setGrade(String(sub.grade ?? ""));
    setFeedback(sub.feedback ?? "");
  };

  const submitReview = async (sub: SubmissionRow) => {
    if (reviewStatus === "approved") {
      const g = Number(grade);
      if (!Number.isFinite(g) || g < 0 || g > 100) {
        toast("error", "Invalid grade", "Enter a grade between 0 and 100.");
        return;
      }
    }
    if (!feedback.trim()) {
      toast("error", "Feedback required", "Write feedback for the student.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/submissions/${sub.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          feedback: feedback.trim(),
          grade: reviewStatus === "approved" ? grade : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast("error", data.error ?? "Failed to review");
        return;
      }
      toast("success", "Review submitted", `Submission ${reviewStatus}.`);
      setReviewingId(null);
      setGrade("");
      setFeedback("");
      await fetchSubmissions();
    } catch {
      toast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell requiredRoles={["admin", "super_admin", "mentor"]}>
      <PageHeader
        title="Submissions Review"
        description="Review and grade student submissions across all assignments."
        actions={
          <Badge variant="warning">{counts.submitted} awaiting review</Badge>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 w-full sm:w-44 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        {(debouncedSearch || statusFilter) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
              setStatusFilter("");
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-10 w-10" />}
          title="No submissions found"
          description="There are no submissions matching your filters."
        />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Task</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Submitted</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visible.map((sub) => {
                    const badge = STATUS_BADGE[sub.status] ?? STATUS_BADGE.submitted;
                    return (
                      <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={sub.studentName} />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{sub.studentName}</p>
                              <p className="text-xs text-muted-foreground truncate">{sub.studentEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium max-w-[200px] truncate">{sub.taskTitle}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{TYPE_LABEL[sub.linkType ?? "other"] ?? sub.linkType ?? "Link"}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(sub.submittedAt)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {sub.links[0] && (
                              <a href={sub.links[0]} target="_blank" rel="noreferrer" title="Open submission link" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <Button variant="ghost" size="icon" title="Review" onClick={() => openReview(sub)}>
                              <ChevronDown className={`h-4 w-4 transition-transform ${reviewingId === sub.id ? "rotate-180" : ""}`} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-4 md:hidden">
            {visible.map((sub) => {
              const badge = STATUS_BADGE[sub.status] ?? STATUS_BADGE.submitted;
              const isOpen = reviewingId === sub.id;
              return (
                <Card key={sub.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Avatar name={sub.studentName} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{sub.studentName}</p>
                          <p className="text-xs text-muted-foreground truncate">{sub.studentEmail}</p>
                          <p className="mt-1 text-xs text-muted-foreground truncate">{sub.taskTitle}</p>
                        </div>
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{TYPE_LABEL[sub.linkType ?? "other"] ?? "Link"}</Badge>
                      <span>{formatDateTime(sub.submittedAt)}</span>
                    </div>
                    {sub.links[0] && (
                      <a
                        href={sub.links[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 flex items-center gap-1.5 break-all font-mono text-xs text-brand-500 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> {sub.links[0]}
                      </a>
                    )}
                    <div className="mt-3 flex justify-end gap-1">
                      {sub.links[0] && (
                        <a href={sub.links[0]} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-transparent px-3 text-xs font-medium hover:bg-muted">
                          <ExternalLink className="h-3.5 w-3.5" /> Open
                        </a>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openReview(sub)}>
                        Review
                      </Button>
                    </div>

                    {isOpen && (
                      <div className="mt-4 space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex flex-wrap gap-2">
                          {(["approved", "revision", "rejected"] as const).map((s) => (
                            <label key={s} className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name={`review-${sub.id}`}
                                checked={reviewStatus === s}
                                onChange={() => setReviewStatus(s)}
                                className="accent-brand-500"
                              />
                              {s === "approved" ? "Approved" : s === "revision" ? "Request Revision" : "Rejected"}
                            </label>
                          ))}
                        </div>
                        {reviewStatus === "approved" && (
                          <Field label="Grade (0–100)">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={grade}
                              onChange={(e) => setGrade(e.target.value)}
                              placeholder="e.g. 85"
                            />
                          </Field>
                        )}
                        <Field label="Feedback">
                          <Textarea
                            rows={3}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Write feedback for the student..."
                          />
                        </Field>
                        <Button
                          variant="gradient"
                          size="sm"
                          className="w-full"
                          onClick={() => submitReview(sub)}
                          loading={saving}
                        >
                          Submit Review
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {visible.length} submission{visible.length !== 1 ? "s" : ""} shown
          </p>
        </>
      )}
    </DashboardShell>
  );
}
