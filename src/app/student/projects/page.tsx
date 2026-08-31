"use client";

import { useEffect, useState } from "react";
import {
  FolderKanban, Clock, CheckCircle2, ExternalLink, AlertCircle, RefreshCw,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/progress";

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  deadlineDays: number;
  status: "not_started" | "in_progress" | "submitted" | "under_review" | "approved";
  submissionLink?: string;
  feedback?: string;
  grade?: number;
  submittedAt?: string;
}

const statusConfig: Record<string, { variant: "default" | "primary" | "success" | "warning" | "info" | "destructive"; label: string }> = {
  not_started: { variant: "default", label: "Not Started" },
  in_progress: { variant: "info", label: "In Progress" },
  submitted: { variant: "primary", label: "Submitted" },
  under_review: { variant: "warning", label: "Under Review" },
  approved: { variant: "success", label: "Approved" },
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      const json = await res.json();
      setProjects(json.projects ?? []);
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
        <h3 className="text-lg font-semibold mb-2">Failed to load projects</h3>
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
        title="Projects"
        description="Track your project assignments and submissions."
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-10 w-10" />}
          title="No projects yet"
          description="Projects will appear here as they are assigned."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const config = statusConfig[project.status] ?? statusConfig.not_started;
            return (
              <Card key={project.id} className="flex flex-col transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge variant={config.variant} className="shrink-0 text-[10px]">
                      {config.label}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-[10px] capitalize">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {project.deadlineDays} days deadline
                    </div>

                    {/* Grade */}
                    {typeof project.grade === "number" && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        <span className="font-medium">Grade: {project.grade}/100</span>
                      </div>
                    )}

                    {/* Feedback */}
                    {project.feedback && (
                      <div className="rounded-lg border border-border bg-muted/20 p-3">
                        <p className="text-xs text-muted-foreground mb-1">Feedback</p>
                        <p className="text-sm">{project.feedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Submission link */}
                  {project.submissionLink && (
                    <a
                      href={project.submissionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center gap-2 text-sm text-violet-500 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Submission
                    </a>
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
