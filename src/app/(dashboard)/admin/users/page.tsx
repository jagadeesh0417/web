"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search, Download, Users, ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABEL } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import type { Role } from "@/lib/types";

const ROLES: Role[] = [
  "guest", "user", "client", "applicant", "intern", "mentor", "employee", "admin", "super_admin",
];

interface EnrollmentInfo {
  id: string;
  programTitle: string;
  categorySlug: string;
  status: string;
  durationWeeks: number;
  startedAt: string;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  company?: string;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  enrollment: EnrollmentInfo | null;
  totalEnrollments: number;
}

interface UsersResponse {
  users: UserRow[];
  total: number;
  page: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const { toast } = useToast();
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter]);

  const fetchUsers = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));

    try {
      const res = await fetch(`/api/admin/users?${params.toString()}`, { signal: controller.signal });
      if (!res.ok) throw new Error("Failed to fetch");
      const json: UsersResponse = await res.json();
      setData(json);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast("error", "Failed to load users", "Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter, page, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
    if (searchRef.current) searchRef.current.value = "";
  };

  const hasFilters = debouncedSearch || roleFilter || statusFilter;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/users/export", { method: "POST" });
      if (!res.ok) throw new Error("Export failed");
      const { csv, total } = await res.json();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast("success", "Export complete", `${total} users exported as CSV.`);
    } catch {
      toast("error", "Export failed", "Could not export users.");
    } finally {
      setExporting(false);
    }
  };

  const renderPageNumbers = () => {
    if (!data) return null;
    const { totalPages, page: currentPage } = data;
    if (totalPages <= 1) return null;
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages.map((p, idx) =>
      p === "..." ? (
        <span key={`dots-${idx}`} className="px-1 text-muted-foreground">…</span>
      ) : (
        <button
          key={p}
          onClick={() => setPage(p)}
          className={`h-8 min-w-[2rem] rounded-lg px-2 text-xs font-medium transition-colors ${
            p === currentPage
              ? "bg-brand-600 text-white"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {p}
        </button>
      )
    );
  };

  const statusBadge = (u: UserRow) => {
    const isActive = u.role !== "guest";
    return (
      <Badge variant={isActive ? "success" : "warning"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  return (
    <DashboardShell requiredRoles={["admin", "super_admin"]}>
      <PageHeader
        title="Users"
        description="Manage all platform accounts, enrollments, and roles."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} loading={exporting}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="Search by name, email, or phone…"
            defaultValue={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 w-full sm:w-40 text-sm"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 w-full sm:w-36 text-sm"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Total count */}
      {data && (
        <p className="mb-3 text-xs text-muted-foreground">
          {data.total} user{data.total !== 1 ? "s" : ""} total
          {hasFilters ? " (filtered)" : ""}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && !data ? (
        <Card className="overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </Card>
      ) : data && data.users.length === 0 ? (
        /* Empty state */
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-base font-semibold">No users found</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            {hasFilters
              ? "Try adjusting your search or filters."
              : "No users have registered yet."}
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </Card>
      ) : data ? (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Internship</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.users.map((u) => (
                    <tr
                      key={u.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => {
                        window.location.href = `/admin/users/${u.id}`;
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} src={u.avatarUrl} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{u.phone || "—"}</td>
                      <td className="px-4 py-3">
                        {u.enrollment ? (
                          <div>
                            <p className="text-xs font-medium">{u.enrollment.programTitle}</p>
                            <p className="text-[11px] text-muted-foreground capitalize">{u.enrollment.status.replace("_", " ")}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{statusBadge(u)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {data.users.map((u) => (
              <Link
                key={u.id}
                href={`/admin/users/${u.id}`}
                className="block"
              >
                <Card className="p-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-start gap-3">
                    <Avatar name={u.name} src={u.avatarUrl} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium truncate">{u.name}</p>
                        {statusBadge(u)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      {u.phone && <p className="mt-1 text-xs text-muted-foreground">{u.phone}</p>}
                      {u.enrollment && (
                        <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2">
                          <p className="text-xs font-medium">{u.enrollment.programTitle}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">
                            {u.enrollment.status.replace("_", " ")} · {u.enrollment.durationWeeks} weeks
                          </p>
                        </div>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">Joined {formatDate(u.createdAt)}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.page <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {renderPageNumbers()}
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={data.page >= data.totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}
    </DashboardShell>
  );
}
