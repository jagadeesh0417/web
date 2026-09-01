"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen, Plus, Pencil, Archive, Search, ChevronLeft, ChevronRight, Upload,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  category: string;
  level: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  _count?: { modules: number; lessons: number };
}

const PAGE_SIZE = 10;

const statusFilterOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

function statusBadgeVariant(status: string) {
  switch (status) {
    case "PUBLISHED": return "success" as const;
    case "DRAFT": return "warning" as const;
    case "ARCHIVED": return "default" as const;
    default: return "default" as const;
  }
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminCoursesPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [archiving, setArchiving] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data);
    } catch {
      toast("error", "Fetch failed", "Could not load courses.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleArchive = async (id: string) => {
    setArchiving(id);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      if (!res.ok) throw new Error("Archive failed");
      toast("success", "Archived", "Course has been archived.");
      await fetchCourses();
    } catch {
      toast("error", "Archive failed", "Could not archive the course.");
    } finally {
      setArchiving(null);
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Courses"
        description="Create and manage courses, modules, and lessons."
        actions={
          <Link href="/admin/courses/new">
            <Button variant="gradient" size="sm">
              <Plus className="h-4 w-4" /> Create Course
            </Button>
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="pl-9"
          />
        </div>
        <CustomSelect
          options={statusFilterOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
          className="w-full sm:w-48"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : paginated.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No courses found"
          description={search || statusFilter !== "ALL" ? "Try adjusting your filters." : "Create your first course to get started."}
          action={
            !search && statusFilter === "ALL" ? (
              <Link href="/admin/courses/new">
                <Button variant="gradient" size="sm"><Plus className="h-4 w-4" /> Create Course</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Modules</TableHead>
                    <TableHead>Lessons</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.category} · {c.level}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(c.status)}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c._count?.modules ?? 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c._count?.lessons ?? 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(c.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Link href={`/admin/courses/${c.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </Button>
                          </Link>
                          <Link href={`/admin/courses/${c.id}/upload`}>
                            <Button variant="ghost" size="sm">
                              <Upload className="h-3.5 w-3.5" /> Upload
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(c.id)}
                            loading={archiving === c.id}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Archive className="h-3.5 w-3.5" /> Archive
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} courses
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === safePage ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className="min-w-[32px]"
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
