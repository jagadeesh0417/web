"use client";

import { useEffect, useState } from "react";
import {
  Download, FileText, ExternalLink, AlertCircle, RefreshCw, FolderOpen,
} from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Resource {
  name: string;
  type: string;
  description: string;
}

interface ModuleResources {
  moduleId: string;
  moduleTitle: string;
  week: number;
  resources: Resource[];
}

const typeColors: Record<string, string> = {
  pdf: "bg-destructive/10 text-destructive",
  document: "bg-info/10 text-info",
  link: "bg-success/10 text-success",
  video: "bg-violet-600/10 text-violet-600",
  default: "bg-muted text-muted-foreground",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((j) => (
                <Card key={j} className="p-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-8 w-24" />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<ModuleResources[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/resources");
      if (!res.ok) throw new Error("Failed to load resources");
      const json = await res.json();
      setResources(json.resources ?? []);
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
        <h3 className="text-lg font-semibold mb-2">Failed to load resources</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const hasResources = resources.some((m) => m.resources.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resources"
        description="Download course materials, documents, and reference links."
      />

      {!hasResources ? (
        <EmptyState
          icon={<FolderOpen className="h-10 w-10" />}
          title="No resources available"
          description="Course resources will appear here as they are added."
        />
      ) : (
        <div className="space-y-8">
          {resources.filter((m) => m.resources.length > 0).map((module) => (
            <div key={module.moduleId} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="info" className="text-[10px]">Week {module.week}</Badge>
                <h2 className="text-base font-semibold">{module.moduleTitle}</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {module.resources.map((resource, i) => {
                  const typeLower = resource.type.toLowerCase();
                  const colorClass = typeColors[typeLower] ?? typeColors.default;

                  return (
                    <Card key={i} className="flex flex-col transition-all hover:shadow-md">
                      <CardContent className="flex flex-col flex-1 p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                            colorClass,
                          )}>
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{resource.name}</p>
                            <Badge variant="outline" className="mt-1 text-[10px] uppercase">
                              {resource.type}
                            </Badge>
                          </div>
                        </div>

                        {resource.description && (
                          <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                        )}

                        <div className="mt-auto pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              const url = resource.name.startsWith("http")
                                ? resource.name
                                : `/resources/${resource.name}`;
                              window.open(url, "_blank");
                            }}
                          >
                            {resource.type.toLowerCase() === "link" ? (
                              <>
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open Link
                              </>
                            ) : (
                              <>
                                <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
