"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileStack, Plus, Pencil, Trash2, ExternalLink,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface Resource {
  id: string;
  name: string;
  type: string;
  url: string;
  moduleId?: string;
  description?: string;
  resourceStatus?: string;
  createdAt: string;
}

interface Module {
  id: string;
  title: string;
  week: number;
  categorySlug: string;
}

interface ResourceForm {
  title: string;
  type: string;
  url: string;
  moduleId: string;
  description: string;
}

const emptyForm: ResourceForm = {
  title: "",
  type: "pdf",
  url: "",
  moduleId: "",
  description: "",
};

const TYPE_OPTIONS = [
  { value: "pdf", label: "PDF" },
  { value: "document", label: "Document" },
  { value: "link", label: "Link" },
  { value: "file", label: "File" },
];

const TYPE_BADGE: Record<string, { variant: "info" | "success" | "warning" | "outline" | "destructive" | "primary" | "default" }> = {
  pdf: { variant: "destructive" },
  doc: { variant: "info" },
  document: { variant: "info" },
  link: { variant: "primary" },
  file: { variant: "success" },
};

export default function AdminResourcesPage() {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResourceForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resRes, modRes] = await Promise.all([
        fetch("/api/admin/resources"),
        fetch("/api/admin/modules"),
      ]);
      const resData = await resRes.json();
      const modData = await modRes.json();
      setResources(Array.isArray(resData) ? resData : []);
      setModules(Array.isArray(modData) ? modData : []);
    } catch {
      toast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const moduleMap = useMemo(() => {
    const map: Record<string, Module> = {};
    for (const m of modules) map[m.id] = m;
    return map;
  }, [modules]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowCreate(false);
  };

  const startEdit = (res: Resource) => {
    setForm({
      title: res.name,
      type: res.type === "doc" ? "document" : res.type,
      url: res.url,
      moduleId: res.moduleId ?? "",
      description: res.description ?? "",
    });
    setEditingId(res.id);
    setShowCreate(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast("error", "Title is required");
      return;
    }
    if (!form.url.trim()) {
      toast("error", "URL is required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        type: form.type,
        url: form.url.trim(),
        moduleId: form.moduleId,
        description: form.description.trim(),
      };

      const res = editingId
        ? await fetch(`/api/admin/resources/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/admin/resources", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const data = await res.json();
        toast("error", data.error ?? "Failed to save resource");
        return;
      }

      toast("success", editingId ? "Resource updated" : "Resource created");
      resetForm();
      await fetchData();
    } catch {
      toast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("error", "Failed to delete resource");
        return;
      }
      toast("success", "Resource deleted");
      setConfirmDeleteId(null);
      await fetchData();
    } catch {
      toast("error", "Network error");
    } finally {
      setDeletingId(null);
    }
  };

  const setField = (field: keyof ResourceForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const typeBadge = (type: string) => {
    const badge = TYPE_BADGE[type] ?? { variant: "outline" as const };
    return <Badge variant={badge.variant}>{type.toUpperCase()}</Badge>;
  };

  return (
    <DashboardShell requiredRoles={["admin", "super_admin"]}>
      <PageHeader
        title="Resources"
        description="Manage downloadable files, documents, and reference links for modules."
        actions={
          <Button variant="gradient" size="sm" onClick={() => { resetForm(); setShowCreate(true); }}>
            <Plus className="h-4 w-4" /> Add Resource
          </Button>
        }
      />

      {/* Create Form */}
      {showCreate && (
        <Card className="mb-6 border-brand-500/40">
          <CardContent className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Module 1 Slides"
                />
              </Field>
              <Field label="Type">
                <Select value={form.type} onChange={(e) => setField("type", e.target.value)}>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="URL" hint="Link to the resource file or page">
                <Input
                  value={form.url}
                  onChange={(e) => setField("url", e.target.value)}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Module">
                <Select value={form.moduleId} onChange={(e) => setField("moduleId", e.target.value)}>
                  <option value="">No module</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>Week {m.week} — {m.title}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Description">
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Brief description of this resource"
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={resetForm}>Cancel</Button>
              <Button variant="gradient" onClick={handleSave} loading={saving}>
                Create Resource
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingId && (
        <Card className="mb-6 border-brand-500/40">
          <CardContent className="p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="e.g. Module 1 Slides"
                />
              </Field>
              <Field label="Type">
                <Select value={form.type} onChange={(e) => setField("type", e.target.value)}>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="URL">
                <Input
                  value={form.url}
                  onChange={(e) => setField("url", e.target.value)}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Module">
                <Select value={form.moduleId} onChange={(e) => setField("moduleId", e.target.value)}>
                  <option value="">No module</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>Week {m.week} — {m.title}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Description">
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Brief description of this resource"
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={resetForm}>Cancel</Button>
              <Button variant="gradient" onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" />
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          icon={<FileStack className="h-10 w-10" />}
          title="No resources yet"
          description="Add your first resource to get started."
          action={
            <Button variant="gradient" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> Add Resource
            </Button>
          }
        />
      ) : (
        <>
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Module</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {resources.map((res) => {
                    const mod = res.moduleId ? moduleMap[res.moduleId] : undefined;
                    const isActive = (res.resourceStatus ?? "active") === "active";
                    return (
                      <tr key={res.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="font-medium truncate">{res.name}</p>
                            {res.description && (
                              <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">{res.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{typeBadge(res.type)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {mod ? `Week ${mod.week} — ${mod.title}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={isActive ? "success" : "outline"}>
                            {isActive ? "Active" : "Archived"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {res.url && (
                              <a href={res.url} target="_blank" rel="noreferrer" title="Open resource" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <Button variant="ghost" size="icon" title="Edit" onClick={() => startEdit(res)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {confirmDeleteId === res.id ? (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(res.id)}
                                  loading={deletingId === res.id}
                                >
                                  Confirm
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="icon" title="Delete" onClick={() => setConfirmDeleteId(res.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
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
          <div className="space-y-3 md:hidden">
            {resources.map((res) => {
              const mod = res.moduleId ? moduleMap[res.moduleId] : undefined;
              const isActive = (res.resourceStatus ?? "active") === "active";
              return (
                <Card key={res.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{res.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {typeBadge(res.type)}
                          <Badge variant={isActive ? "success" : "outline"}>
                            {isActive ? "Active" : "Archived"}
                          </Badge>
                        </div>
                        {mod && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Week {mod.week} — {mod.title}
                          </p>
                        )}
                        {res.description && (
                          <p className="mt-1 text-xs text-muted-foreground truncate">{res.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-1">
                      {res.url && (
                        <a href={res.url} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-transparent px-3 text-xs font-medium hover:bg-muted">
                          <ExternalLink className="h-3.5 w-3.5" /> Open
                        </a>
                      )}
                      <Button variant="outline" size="sm" onClick={() => startEdit(res)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      {confirmDeleteId === res.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(res.id)}
                            loading={deletingId === res.id}
                          >
                            Delete
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(res.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {resources.length} resource{resources.length !== 1 ? "s" : ""} total
          </p>
        </>
      )}
    </DashboardShell>
  );
}
