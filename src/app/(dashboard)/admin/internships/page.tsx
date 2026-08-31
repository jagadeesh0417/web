"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpen, Plus, Pencil, Trash2, Save, Search, X, AlertTriangle,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import {
  Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import type {
  InternshipProgram,
  InternshipCategory,
} from "@/lib/types";
import type { Plan } from "@/lib/data/server-store";

type Tab = "programs" | "categories" | "plans";

const programDefaults = {
  slug: "",
  title: "",
  description: "",
  duration: "",
  price: 0,
  featured: false,
  features: "",
  modules: "",
  projects: 0,
  status: "active" as "active" | "inactive",
};

const categoryDefaults = {
  slug: "",
  name: "",
  icon: "",
  gradient: "",
  description: "",
  learningOutcomes: "",
  skills: "",
  prerequisites: "",
  mentorId: "admin",
  status: "active" as "active" | "inactive",
};

const planDefaults = {
  programId: "",
  name: "",
  duration: "",
  price: 0,
  currency: "INR",
  description: "",
  features: "",
  status: "active" as "active" | "inactive",
};

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

function DeleteDialog({
  open,
  onConfirm,
  onCancel,
  name,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  name: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Delete {name}</h3>
            <p className="text-sm text-muted-foreground">This will set the item to inactive.</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminInternshipsPage() {
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("programs");

  const [programs, setPrograms] = useState<InternshipProgram[]>([]);
  const [categories, setCategories] = useState<InternshipCategory[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [search, setSearch] = useState("");

  const [programForm, setProgramForm] = useState(programDefaults);
  const [categoryForm, setCategoryForm] = useState(categoryDefaults);
  const [planForm, setPlanForm] = useState(planDefaults);

  const fetchAll = useCallback(async () => {
    try {
      const [pRes, cRes, plRes] = await Promise.all([
        fetch("/api/admin/programs"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/plans"),
      ]);
      if (pRes.ok) setPrograms(await pRes.json());
      if (cRes.ok) setCategories(await cRes.json());
      if (plRes.ok) setPlans(await plRes.json());
    } catch {
      toast("error", "Fetch failed", "Could not load data from server.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    setCreating(false);
    setEditing(null);
    setSearch("");
    setProgramForm(programDefaults);
    setCategoryForm(categoryDefaults);
    setPlanForm(planDefaults);
  }, [tab]);

  const resetForms = () => {
    setCreating(false);
    setEditing(null);
    setProgramForm(programDefaults);
    setCategoryForm(categoryDefaults);
    setPlanForm(planDefaults);
  };

  // ── Programs CRUD ────────────────────────────────────────────────────────

  const handleSaveProgram = async () => {
    if (!programForm.title.trim() || !programForm.slug.trim()) {
      toast("error", "Validation", "Title and slug are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...programForm,
        features: programForm.features.split("\n").filter(Boolean),
        modules: programForm.modules.split("\n").filter(Boolean),
        projects: Number(programForm.projects) || 0,
        price: Number(programForm.price) || 0,
      };
      const isEdit = !!editing;
      const url = isEdit ? `/api/admin/programs/${editing}` : "/api/admin/programs";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Request failed");
      }
      toast("success", isEdit ? "Updated" : "Created", `${programForm.title} has been ${isEdit ? "updated" : "created"}.`);
      resetForms();
      await fetchAll();
    } catch (e: unknown) {
      toast("error", "Save failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProgram = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/programs/${deleting}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast("success", "Deleted", "Program set to inactive.");
      setDeleting(null);
      await fetchAll();
    } catch {
      toast("error", "Delete failed", "Could not delete the program.");
    } finally {
      setSaving(false);
    }
  };

  const startEditProgram = (p: InternshipProgram) => {
    setEditing(p.id);
    setCreating(false);
    setProgramForm({
      slug: p.slug,
      title: p.title,
      description: p.description,
      duration: p.duration,
      price: p.price,
      featured: p.featured,
      features: p.features.join("\n"),
      modules: p.modules.join("\n"),
      projects: p.projects,
      status: p.status,
    });
  };

  // ── Categories CRUD ──────────────────────────────────────────────────────

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) {
      toast("error", "Validation", "Name and slug are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...categoryForm,
        learningOutcomes: categoryForm.learningOutcomes.split("\n").filter(Boolean),
        skills: categoryForm.skills.split("\n").filter(Boolean),
        prerequisites: categoryForm.prerequisites.split("\n").filter(Boolean),
      };
      const isEdit = !!editing;
      const url = isEdit ? `/api/admin/categories/${editing}` : "/api/admin/categories";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Request failed");
      }
      toast("success", isEdit ? "Updated" : "Created", `${categoryForm.name} has been ${isEdit ? "updated" : "created"}.`);
      resetForms();
      await fetchAll();
    } catch (e: unknown) {
      toast("error", "Save failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleting}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast("success", "Deleted", "Category set to inactive.");
      setDeleting(null);
      await fetchAll();
    } catch {
      toast("error", "Delete failed", "Could not delete the category.");
    } finally {
      setSaving(false);
    }
  };

  const startEditCategory = (c: InternshipCategory) => {
    setEditing(c.id);
    setCreating(false);
    setCategoryForm({
      slug: c.slug,
      name: c.name,
      icon: c.icon,
      gradient: c.gradient,
      description: c.description,
      learningOutcomes: c.learningOutcomes.join("\n"),
      skills: c.skills.join("\n"),
      prerequisites: c.prerequisites.join("\n"),
      mentorId: c.mentorId,
      status: c.status,
    });
  };

  // ── Plans CRUD ───────────────────────────────────────────────────────────

  const handleSavePlan = async () => {
    if (!planForm.name.trim() || !planForm.programId.trim()) {
      toast("error", "Validation", "Name and program are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...planForm,
        features: planForm.features.split("\n").filter(Boolean),
        price: Number(planForm.price) || 0,
      };
      const isEdit = !!editing;
      const url = isEdit ? `/api/admin/plans/${editing}` : "/api/admin/plans";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Request failed");
      }
      toast("success", isEdit ? "Updated" : "Created", `${planForm.name} has been ${isEdit ? "updated" : "created"}.`);
      resetForms();
      await fetchAll();
    } catch (e: unknown) {
      toast("error", "Save failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/plans/${deleting}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast("success", "Deleted", "Plan set to inactive.");
      setDeleting(null);
      await fetchAll();
    } catch {
      toast("error", "Delete failed", "Could not delete the plan.");
    } finally {
      setSaving(false);
    }
  };

  const startEditPlan = (pl: Plan) => {
    setEditing(pl.id);
    setCreating(false);
    setPlanForm({
      programId: pl.programId,
      name: pl.name,
      duration: pl.duration,
      price: pl.price,
      currency: pl.currency,
      description: pl.description,
      features: pl.features.join("\n"),
      status: pl.status,
    });
  };

  // ── Derived ──────────────────────────────────────────────────────────────

  const filteredPrograms = programs.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredPlans = plans.filter(
    (pl) =>
      pl.name.toLowerCase().includes(search.toLowerCase()) ||
      pl.duration.toLowerCase().includes(search.toLowerCase()),
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "programs", label: "Programs", count: programs.length },
    { key: "categories", label: "Categories", count: categories.length },
    { key: "plans", label: "Plans", count: plans.length },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Internships"
        description="Manage programs, categories, plans and pricing."
        actions={
          <Button variant="gradient" size="sm" onClick={() => { if (creating) { resetForms(); } else { setCreating(true); } setEditing(null); }}>
            {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {creating ? "Cancel" : `New ${tab === "programs" ? "program" : tab === "categories" ? "category" : "plan"}`}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="mb-5 inline-flex items-center gap-1 rounded-lg bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              tab === t.key ? "bg-card shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t.label}
            <span className="text-xs text-muted-foreground">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="pl-9"
          />
        </div>
      </div>

      {/* Create / Edit Form */}
      {(creating || editing) && (
        <Card className="mb-6 border-brand-500/40">
          <CardHeader>
            <CardTitle>
              {editing ? `Edit ${tab.slice(0, -1)}` : `New ${tab.slice(0, -1)}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ── Program Form ── */}
            {tab === "programs" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title" htmlFor="prog-title">
                  <Input id="prog-title" value={programForm.title} onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })} placeholder="e.g. Full Stack Development" />
                </Field>
                <Field label="Slug" htmlFor="prog-slug">
                  <Input id="prog-slug" value={programForm.slug} onChange={(e) => setProgramForm({ ...programForm, slug: e.target.value })} placeholder="full-stack-development" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description" htmlFor="prog-desc">
                    <Textarea id="prog-desc" value={programForm.description} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} placeholder="Short description..." />
                  </Field>
                </div>
                <Field label="Duration" htmlFor="prog-dur">
                  <Input id="prog-dur" value={programForm.duration} onChange={(e) => setProgramForm({ ...programForm, duration: e.target.value })} placeholder="e.g. 8 weeks" />
                </Field>
                <Field label="Price (₹)" htmlFor="prog-price">
                  <Input id="prog-price" type="number" value={programForm.price} onChange={(e) => setProgramForm({ ...programForm, price: Number(e.target.value) })} />
                </Field>
                <Field label="Projects" htmlFor="prog-proj">
                  <Input id="prog-proj" type="number" value={programForm.projects} onChange={(e) => setProgramForm({ ...programForm, projects: Number(e.target.value) })} />
                </Field>
                <Field label="Status" htmlFor="prog-status">
                  <Select id="prog-status" value={programForm.status} onChange={(e) => setProgramForm({ ...programForm, status: e.target.value as "active" | "inactive" })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Features (one per line)" htmlFor="prog-feat">
                    <Textarea id="prog-feat" rows={3} value={programForm.features} onChange={(e) => setProgramForm({ ...programForm, features: e.target.value })} placeholder="Live projects\nMentorship\nCertificate" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Modules (one per line)" htmlFor="prog-mod">
                    <Textarea id="prog-mod" rows={3} value={programForm.modules} onChange={(e) => setProgramForm({ ...programForm, modules: e.target.value })} placeholder="React fundamentals\nNode.js backend\nDeployment" />
                  </Field>
                </div>
              </div>
            )}

            {/* ── Category Form ── */}
            {tab === "categories" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="cat-name">
                  <Input id="cat-name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g. Cloud Engineering" />
                </Field>
                <Field label="Slug" htmlFor="cat-slug">
                  <Input id="cat-slug" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} placeholder="cloud-engineering" />
                </Field>
                <Field label="Icon" htmlFor="cat-icon">
                  <Input id="cat-icon" value={categoryForm.icon} onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })} placeholder="lucide icon name e.g. Cloud" />
                </Field>
                <Field label="Gradient" htmlFor="cat-gradient">
                  <Input id="cat-gradient" value={categoryForm.gradient} onChange={(e) => setCategoryForm({ ...categoryForm, gradient: e.target.value })} placeholder="from-blue-500 to-cyan-500" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description" htmlFor="cat-desc">
                    <Textarea id="cat-desc" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Description..." />
                  </Field>
                </div>
                <Field label="Learning Outcomes (one per line)" htmlFor="cat-lo">
                  <Textarea id="cat-lo" rows={3} value={categoryForm.learningOutcomes} onChange={(e) => setCategoryForm({ ...categoryForm, learningOutcomes: e.target.value })} placeholder="Understand CI/CD\nDeploy to cloud" />
                </Field>
                <Field label="Skills (one per line)" htmlFor="cat-skills">
                  <Textarea id="cat-skills" rows={3} value={categoryForm.skills} onChange={(e) => setCategoryForm({ ...categoryForm, skills: e.target.value })} placeholder="AWS\nDocker\nKubernetes" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Prerequisites (one per line)" htmlFor="cat-pre">
                    <Textarea id="cat-pre" rows={3} value={categoryForm.prerequisites} onChange={(e) => setCategoryForm({ ...categoryForm, prerequisites: e.target.value })} placeholder="Basic programming\nLinux CLI" />
                  </Field>
                </div>
                <Field label="Status" htmlFor="cat-status">
                  <Select id="cat-status" value={categoryForm.status} onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value as "active" | "inactive" })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </Field>
              </div>
            )}

            {/* ── Plan Form ── */}
            {tab === "plans" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="plan-name">
                  <Input id="plan-name" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} placeholder="e.g. Basic Plan" />
                </Field>
                <Field label="Program" htmlFor="plan-prog">
                  <Select id="plan-prog" value={planForm.programId} onChange={(e) => setPlanForm({ ...planForm, programId: e.target.value })}>
                    <option value="">Select a program</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Duration" htmlFor="plan-dur">
                  <Input id="plan-dur" value={planForm.duration} onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })} placeholder="e.g. 4 weeks" />
                </Field>
                <Field label="Price" htmlFor="plan-price">
                  <Input id="plan-price" type="number" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })} />
                </Field>
                <Field label="Currency" htmlFor="plan-cur">
                  <Input id="plan-cur" value={planForm.currency} onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })} placeholder="INR" />
                </Field>
                <Field label="Status" htmlFor="plan-status">
                  <Select id="plan-status" value={planForm.status} onChange={(e) => setPlanForm({ ...planForm, status: e.target.value as "active" | "inactive" })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description" htmlFor="plan-desc">
                    <Textarea id="plan-desc" value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} placeholder="Description..." />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Features (one per line)" htmlFor="plan-feat">
                    <Textarea id="plan-feat" rows={3} value={planForm.features} onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} placeholder="Mentorship\n1:1 sessions\nCertificate" />
                  </Field>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={resetForms}>Cancel</Button>
              <Button variant="gradient" loading={saving} onClick={
                tab === "programs" ? handleSaveProgram : tab === "categories" ? handleSaveCategory : handleSavePlan
              }>
                <Save className="h-4 w-4" />
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <DeleteDialog
        open={!!deleting}
        name={deleteName}
        onConfirm={tab === "programs" ? handleDeleteProgram : tab === "categories" ? handleDeleteCategory : handleDeletePlan}
        onCancel={() => { setDeleting(null); setDeleteName(""); }}
      />

      {/* ── Programs Table ── */}
      {tab === "programs" && (
        loading ? (
          <Card><CardContent><table className="w-full"><tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</tbody></table></CardContent></Card>
        ) : filteredPrograms.length === 0 ? (
          <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No programs found" description={search ? "Try a different search term." : "Create your first program to get started."} action={!search ? <Button variant="gradient" size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New Program</Button> : undefined} />
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.map((p) => (
                    <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          {p.title}
                          {p.featured && <Badge variant="primary" className="text-[10px]">Featured</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.duration}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(p.price)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={p.status === "active" ? "success" : "default"}>{p.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEditProgram(p)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setDeleting(p.id); setDeleteName(p.title); }} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )
      )}

      {/* ── Categories Table ── */}
      {tab === "categories" && (
        loading ? (
          <Card><CardContent><table className="w-full"><tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</tbody></table></CardContent></Card>
        ) : filteredCategories.length === 0 ? (
          <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No categories found" description={search ? "Try a different search term." : "Create your first category to get started."} action={!search ? <Button variant="gradient" size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New Category</Button> : undefined} />
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Icon</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((c) => (
                    <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.slug}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.icon}</td>
                      <td className="px-4 py-3">
                        <Badge variant={c.status === "active" ? "success" : "default"}>{c.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => startEditCategory(c)}>
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setDeleting(c.id); setDeleteName(c.name); }} className="text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )
      )}

      {/* ── Plans Table ── */}
      {tab === "plans" && (
        loading ? (
          <Card><CardContent><table className="w-full"><tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</tbody></table></CardContent></Card>
        ) : filteredPlans.length === 0 ? (
          <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No plans found" description={search ? "Try a different search term." : "Create your first plan to get started."} action={!search ? <Button variant="gradient" size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New Plan</Button> : undefined} />
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Program</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((pl) => {
                    const prog = programs.find((p) => p.id === pl.programId);
                    return (
                      <tr key={pl.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{pl.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{prog?.title ?? pl.programId}</td>
                        <td className="px-4 py-3 text-muted-foreground">{pl.duration}</td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(pl.price, pl.currency)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={pl.status === "active" ? "success" : "default"}>{pl.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => startEditPlan(pl)}>
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setDeleting(pl.id); setDeleteName(pl.name); }} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )
      )}
    </DashboardShell>
  );
}
