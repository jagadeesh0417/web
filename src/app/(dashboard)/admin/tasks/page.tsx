"use client";

import { useEffect, useState } from "react";
import {
  ClipboardCheck, Plus, Pencil, Trash2, Loader2,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const SUBMISSION_TYPES = ["Drive Link", "GitHub", "Live URL", "File Upload"];

interface ApiModule {
  id: string;
  title: string;
  categorySlug: string;
  order: number;
}

interface ApiTask {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  categorySlug: string;
  moduleId?: string;
  week?: number;
  deadline?: string;
  deadlineDays?: number;
  submissionTypes?: string[];
  requiredResources?: string[];
  status?: string;
  taskStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskForm {
  title: string;
  description: string;
  instructions: string;
  moduleId: string;
  week: string;
  deadline: string;
  submissionTypes: string[];
  requiredResources: string;
  status: "draft" | "published";
}

const EMPTY_FORM: TaskForm = {
  title: "",
  description: "",
  instructions: "",
  moduleId: "",
  week: "0",
  deadline: "",
  submissionTypes: ["Drive Link"],
  requiredResources: "",
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

export default function AdminTasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [modules, setModules] = useState<ApiModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<TaskForm>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [tasksRes, modulesRes] = await Promise.all([
        fetch("/api/admin/tasks"),
        fetch("/api/admin/modules"),
      ]);
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (modulesRes.ok) setModules(await modulesRes.json());
    } catch {
      toast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setCreating(false);
    setEditingId(null);
  };

  const startEdit = (task: ApiTask) => {
    setEditingId(task.id);
    setCreating(false);
    setForm({
      title: task.title,
      description: task.description,
      instructions: task.instructions?.[0] ?? "",
      moduleId: task.moduleId ?? "",
      week: String(task.week ?? 0),
      deadline: task.deadline ?? "",
      submissionTypes: task.submissionTypes ?? ["Drive Link"],
      requiredResources: task.requiredResources?.join(", ") ?? "",
      status: (task.taskStatus as "draft" | "published") || "draft",
    });
  };

  const toggleSubmissionType = (type: string) => {
    setForm((prev) => {
      const types = prev.submissionTypes.includes(type)
        ? prev.submissionTypes.filter((t) => t !== type)
        : [...prev.submissionTypes, type];
      return { ...prev, submissionTypes: types.length > 0 ? types : [type] };
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast("error", "Title required", "Give the task a title.");
      return;
    }
    if (!form.description.trim()) {
      toast("error", "Description required", "Add a description for the task.");
      return;
    }

    const selectedModule = modules.find((m) => m.id === form.moduleId);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      instructions: form.instructions.trim(),
      moduleId: form.moduleId,
      categorySlug: selectedModule?.categorySlug ?? "",
      week: Number(form.week) || 0,
      deadline: form.deadline,
      submissionTypes: form.submissionTypes.map((t) => t.toLowerCase().replace(/\s+/g, "_").replace("live_url", "other")),
      requiredResources: form.requiredResources
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
      status: form.status,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/tasks/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast("success", "Task updated", `"${payload.title}" saved successfully.`);
      } else {
        const res = await fetch("/api/admin/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast("success", "Task created", `"${payload.title}" is now available.`);
      }
      resetForm();
      await fetchData();
    } catch {
      toast("error", editingId ? "Update failed" : "Creation failed", "Please try again.");
    }
  };

  const handleDelete = async (task: ApiTask) => {
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast("success", "Task deleted", `"${task.title}" has been removed.`);
      setDeletingId(null);
      await fetchData();
    } catch {
      toast("error", "Delete failed");
    }
  };

  const getModuleName = (moduleId?: string) => {
    if (!moduleId) return "—";
    return modules.find((m) => m.id === moduleId)?.title ?? "Unknown";
  };

  return (
    <DashboardShell requiredRoles={["admin", "super_admin"]}>
      <PageHeader
        title="Tasks"
        description="Create and manage tasks, assignments and deadlines for modules."
        actions={
          <Button variant="gradient" size="sm" onClick={() => { setCreating(!creating); setEditingId(null); setForm(EMPTY_FORM); }}>
            <Plus className="h-4 w-4" /> New task
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
                  placeholder="e.g. Build a landing page"
                />
              </Field>
              <Field label="Module">
                <Select
                  value={form.moduleId}
                  onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
                >
                  <option value="">No module</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Week">
                <Input
                  type="number"
                  min={0}
                  value={form.week}
                  onChange={(e) => setForm({ ...form, week: e.target.value })}
                />
              </Field>
              <Field label="Deadline">
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Description">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What this task covers…"
              />
            </Field>
            <Field label="Instructions">
              <Textarea
                rows={3}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="Step-by-step instructions for the student…"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Status">
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </Field>
              <Field label="Required Resources" hint="Comma-separated">
                <Input
                  value={form.requiredResources}
                  onChange={(e) => setForm({ ...form, requiredResources: e.target.value })}
                  placeholder="e.g. Figma account, VS Code"
                />
              </Field>
            </div>
            <Field label="Submission Types">
              <div className="flex flex-wrap gap-3">
                {SUBMISSION_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.submissionTypes.includes(type)}
                      onChange={() => toggleSubmissionType(type)}
                      className="h-4 w-4 rounded border-border"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={resetForm}>Cancel</Button>
              <Button variant="gradient" onClick={handleSave}>
                {editingId ? "Save changes" : "Create task"}
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
                <th className="px-4 py-3">Module</th>
                <th className="px-4 py-3">Week</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<ClipboardCheck className="h-10 w-10" />}
                      title="No tasks yet"
                      description="Create your first task to assign work to students."
                    />
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="border-b border-border transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{task.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{getModuleName(task.moduleId)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{task.week ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={(task.taskStatus ?? task.status) === "published" ? "success" : "warning"}>
                        {(task.taskStatus ?? task.status) === "published" ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(task)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {deletingId === task.id ? (
                          <div className="flex items-center gap-1">
                            <Button variant="danger" size="sm" onClick={() => handleDelete(task)}>
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
                            onClick={() => setDeletingId(task.id)}
                            title="Delete"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardShell>
  );
}
