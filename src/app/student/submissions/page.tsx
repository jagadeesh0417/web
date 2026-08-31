"use client";

import { useEffect, useState } from "react";
import {
  FileCheck, Clock, CheckCircle2, AlertCircle, ExternalLink, RefreshCw,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/progress";
import { timeAgo, cn } from "@/lib/utils";

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  assignmentDescription?: string;
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
}

const statusConfig: Record<string, { variant: "default" | "primary" | "success" | "warning" | "info" | "destructive"; icon: React.ComponentType<{ className?: string }> }> = {
  submitted: { variant: "info", icon: Clock },
  reviewed: { variant: "primary", icon: FileCheck },
  revision: { variant: "warning", icon: AlertCircle },
  approved: { variant: "success", icon: CheckCircle2 },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/submissions");
      if (!res.ok) throw new Error("Failed to load submissions");
      const json = await res.json();
      setSubmissions(json.submissions ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load submissions</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submissions"
        description="View all your assignment submissions and their review status."
      />

      {submissions.length === 0 ? (
        <EmptyState
          icon={<FileCheck className="h-10 w-10" />}
          title="No submissions yet"
          description="Your assignment submissions will appear here."
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const config = statusConfig[sub.status] ?? statusConfig.submitted;
            const StatusIcon = config.icon;
            return (
              <Card key={sub.id} className="transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                        sub.status === "approved" ? "bg-success/10" :
                        sub.status === "revision" ? "bg-warning/10" :
                        sub.status === "reviewed" ? "bg-violet-600/10" :
                        "bg-info/10",
                      )}>
                        <StatusIcon className={cn(
                          "h-5 w-5",
                          sub.status === "approved" ? "text-success" :
                          sub.status === "revision" ? "text-warning" :
                          sub.status === "reviewed" ? "text-violet-500" :
                          "text-info",
                        )} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{sub.assignmentTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          Submitted {timeAgo(sub.submittedAt)}
                          {sub.reviewedAt && ` · Reviewed ${timeAgo(sub.reviewedAt)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {typeof sub.grade === "number" && (
                        <span className="text-sm font-semibold">{sub.grade}/100</span>
                      )}
                      <Badge variant={config.variant}>
                        {sub.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Feedback */}
                  {sub.feedback && (
                    <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 ml-13">
                      <p className="text-xs text-muted-foreground mb-1">Feedback</p>
                      <p className="text-sm">{sub.feedback}</p>
                    </div>
                  )}

                  {/* Links */}
                  {sub.links.length > 0 && (
                    <div className="mt-3 ml-13 flex flex-wrap gap-2">
                      {sub.links.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/20 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-violet-500/40 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Link {i + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Resubmit action */}
                  {sub.status === "revision" && (
                    <div className="mt-3 ml-13">
                      <a href={`/student/assignments/${sub.assignmentId}`}>
                        <Button variant="outline" size="sm">
                          Resubmit
                        </Button>
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
