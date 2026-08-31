"use client";

import { useEffect, useState } from "react";
import {
  BookOpen, Plus, Pencil, Trash2, ChevronDown, Eye, EyeOff, Loader2,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const CATEGORIES = [
  { value: "web-development", label: "Web Development" },
  { value: "ui-ux-design", label: "UI/UX Design" },
  { value: "meta-ads", label: "Meta Ads" },
  { value: "digital-marketing", label: "Digital Marketing" },
  { value: "automation", label: "Automation" },
  { value: "ai-automation", label: "AI Automation" },
  { value: "graphic-design", label: "Graphic Design" },
  { value: "content-writing", label: "Content Writing" },
  { value: "seo", label: "SEO" },
  { value: "video-editing", label: "Video Editing" },
];

interface ApiModule {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  order: number;
  week: number;
  status?: string;
  lessons: { id: string; title: string; duration: number }[];
  createdAt?: string;
  updatedAt?: string;
}

interface ModuleForm {
  title: string;
  description: string;
  categorySlug: string;
  order: string;
  status: "draft" | "published";
}

const EMPTY_FORM: ModuleForm = {
  title: "",
  description: "",
  categorySlug: "web-development",
  order: "0",
  status: "draft",
};

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminModulesPage() {
  const { toast } = useToast();
  const [modules, setModules] = useState<ApiModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ModuleForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchModules = async () => {
    try {
      const res = await fetch("/api/admin/modules");
      if (!res.ok) throw new Error("Failed to load modules");
      const data = await res.json();
      setModules(data);
    } catch {
      toast("error", "Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setCreating(false);
    setEditingId(null);
  };

  const startEdit = (mod: ApiModule) => {
    setEditingId(mod.id);
    setCreating(false);
    setForm({
      title: mod.title,
      description: mod.description,
      categorySlug: mod.categorySlug,
      order: String(mod.order),
      status: (mod.status as "draft" | "published") || "draft",
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast("error", "Title required", "Give the module a title.");
      return;
    }
    if (!form.description.trim()) {
      toast("error", "Description required", "Add a description for the module.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      categorySlug: form.categorySlug,
      order: Number(form.order) || 0,
      status: form.status,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/modules/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast("success", "Module updated", `"${payload.title}" saved successfully.`);
      } else {
        const res = await fetch("/api/admin/modules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast("success", "Module created", `"${payload.title}" is now available.`);
      }
      resetForm();
      await fetchModules();
    } catch {
      toast("error", editingId ? "Update failed" : "Creation failed", "Please try again.");
    }
  };

  const toggleStatus = async (mod: ApiModule) => {
    const newStatus = mod.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/modules/${mod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      toast("success", newStatus === "published" ? "Module published" : "Module unpublished", `"${mod.title}" is now ${newStatus}.`);
      await fetchModules();
    } catch {
      toast("error", "Status update failed");
    }
  };

  const handleDelete = async (mod: ApiModule) => {
    try {
      const res = await fetch(`/api/admin/modules/${mod.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast("success", "Module deleted", `"${mod.title}" has been removed.`);
      setDeletingId(null);
      await fetchModules();
    } catch {
      toast("error", "Delete failed");
    }
  };

  const getCategoryLabel = (slug: string) =>
    CATEGORIES.find((c) => c.value === slug)?.label ?? slug;

  return (
    <DashboardShell requiredRoles={["admin", "super_admin"]}>
      <PageHeader
        title="Modules"
        description="Create and manage course modules with lessons, ordering and publish state."
        actions={
          <Button variant="gradient" size="sm" onClick={() => { setCreating(!creating); setEditingId(null); setForm(EMPTY_FORM); }}>
            <Plus className="h-4 w-4" /> New module
          </Button>
        }
      />

      {(creating || editingId) && (
        <Card className="mb-6 border-brand-500/40">
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Introduction to HTML"
                />
              </Field>
              <Field label="Category">
                <Select
                  value={form.categorySlug}
                  onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Order">
                <Input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                />
              </Field>
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of what this module covers…"
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={resetForm}>Cancel</Button>
              <Button variant="gradient" onClick={handleSave}>
                {editingId ? "Save changes" : "Create module"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase text-muted-foreground">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Lessons</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : modules.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<BookOpen className="h-10 w-10" />}
                      title="No modules yet"
                      description="Create your first module to start building course content."
                    />
                  </td>
                </tr>
              ) : (
                modules.map((mod) => (
                  <>
                    <tr
                      key={mod.id}
                      className="border-b border-border transition-colors hover:bg-muted/40 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === mod.id ? null : mod.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expandedId === mod.id ? "rotate-180" : ""}`}
                          />
                          <span className="font-medium">{mod.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{getCategoryLabel(mod.categorySlug)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{mod.order}</td>
                      <td className="px-4 py-3">
                        <Badge variant="primary">{mod.lessons?.length ?? 0}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={mod.status === "published" ? "success" : "warning"}>
                          {mod.status === "published" ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEdit(mod)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleStatus(mod)}
                            title={mod.status === "published" ? "Unpublish" : "Publish"}
                          >
                            {mod.status === "published" ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          {deletingId === mod.id ? (
                            <div className="flex items-center gap-1">
                              <Button variant="danger" size="sm" onClick={() => handleDelete(mod)}>
                                <Loader2 className="h-3 w-3 animate-spin" /> Confirm
                              </Button>
                              <Button variant="secondary" size="sm" onClick={() => setDeletingId(null)}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingId(mod.id)}
                              title="Delete"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === mod.id && (
                      <tr key={`${mod.id}-expanded`}>
                        <td colSpan={6} className="border-b border-border bg-muted/20 px-8 py-4">
                          <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Lessons</p>
                          {mod.lessons && mod.lessons.length > 0 ? (
                            <div className="space-y-1.5">
                              {mod.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
                                >
                                  <span className="text-sm font-medium">{lesson.title}</span>
                                  <span className="text-xs text-muted-foreground">{lesson.duration} min</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No lessons in this module yet.</p>
                          )}
                          <p className="mt-3 text-xs text-muted-foreground">{mod.description}</p>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardShell>
  );
}
