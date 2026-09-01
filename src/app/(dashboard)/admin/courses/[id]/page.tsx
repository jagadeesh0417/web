"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Save, Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  ChevronUp, FileVideo, FileText, GripVertical, X,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils";

const CATEGORY_OPTIONS = [
  "Web Development", "Digital Marketing", "UI/UX Design",
  "Data Science", "Mobile Development", "Cybersecurity", "Cloud Computing",
];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const STATUS_OPTIONS = ["DRAFT", "PUBLISHED"];
const LESSON_TYPE_OPTIONS = ["VIDEO", "PDF"];

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: "VIDEO" | "PDF";
  videoUrl: string;
  pdfUrl: string;
  sortOrder: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl: string;
  category: string;
  duration: string;
  level: string;
  price: number;
  status: string;
  sortOrder: number;
  createdAt: string;
  modules: Module[];
}

interface CourseForm {
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  bannerUrl: string;
  category: string;
  duration: string;
  level: string;
  price: number;
  status: string;
  sortOrder: number;
}

interface ModuleForm {
  title: string;
  description: string;
  sortOrder: number;
}

interface LessonForm {
  title: string;
  description: string;
  type: "VIDEO" | "PDF";
  videoUrl: string;
  pdfUrl: string;
  sortOrder: number;
}

function Modal({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-up max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const [form, setForm] = useState<CourseForm>({
    title: "", slug: "", description: "", thumbnailUrl: "", bannerUrl: "",
    category: "", duration: "", level: "Beginner", price: 0, status: "DRAFT", sortOrder: 0,
  });

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const [moduleModal, setModuleModal] = useState<{ open: boolean; editingId: string | null }>({ open: false, editingId: null });
  const [moduleForm, setModuleForm] = useState<ModuleForm>({ title: "", description: "", sortOrder: 0 });
  const [savingModule, setSavingModule] = useState(false);

  const [lessonModal, setLessonModal] = useState<{ open: boolean; moduleId: string; editingId: string | null }>({
    open: false, moduleId: "", editingId: null,
  });
  const [lessonForm, setLessonForm] = useState<LessonForm>({
    title: "", description: "", type: "VIDEO", videoUrl: "", pdfUrl: "", sortOrder: 0,
  });
  const [savingLesson, setSavingLesson] = useState(false);

  const [deletingModule, setDeletingModule] = useState<string | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/courses/${id}`);
      if (!res.ok) throw new Error("Failed to fetch course");
      const data: Course = await res.json();
      setCourse(data);
      setForm({
        title: data.title,
        slug: data.slug,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        bannerUrl: data.bannerUrl,
        category: data.category,
        duration: data.duration,
        level: data.level,
        price: data.price,
        status: data.status,
        sortOrder: data.sortOrder,
      });
    } catch {
      toast("error", "Fetch failed", "Could not load course data.");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  useEffect(() => {
    if (!slugEdited) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, slugEdited]);

  const updateForm = <K extends keyof CourseForm>(key: K, value: CourseForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSaveCourse = async () => {
    if (!form.title.trim()) { toast("error", "Validation", "Title is required."); return; }
    if (!form.slug.trim()) { toast("error", "Validation", "Slug is required."); return; }
    setSavingCourse(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) || 0, sortOrder: Number(form.sortOrder) || 0 }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast("success", "Updated", "Course details saved.");
      await fetchCourse();
    } catch (e: unknown) {
      toast("error", "Save failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSavingCourse(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId); else next.add(moduleId);
      return next;
    });
  };

  // ── Module CRUD ───────────────────────────────────────────────────────────

  const openCreateModule = () => {
    setModuleForm({ title: "", description: "", sortOrder: course?.modules.length ?? 0 });
    setModuleModal({ open: true, editingId: null });
  };

  const openEditModule = (m: Module) => {
    setModuleForm({ title: m.title, description: m.description, sortOrder: m.sortOrder });
    setModuleModal({ open: true, editingId: m.id });
  };

  const handleSaveModule = async () => {
    if (!moduleForm.title.trim()) { toast("error", "Validation", "Module title is required."); return; }
    setSavingModule(true);
    try {
      const isEdit = !!moduleModal.editingId;
      const url = isEdit
        ? `/api/admin/courses/${id}/modules/${moduleModal.editingId}`
        : `/api/admin/courses/${id}/modules`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...moduleForm, sortOrder: Number(moduleForm.sortOrder) || 0 }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast("success", isEdit ? "Updated" : "Created", `Module "${moduleForm.title}" saved.`);
      setModuleModal({ open: false, editingId: null });
      await fetchCourse();
    } catch (e: unknown) {
      toast("error", "Save failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    setDeletingModule(moduleId);
    try {
      const res = await fetch(`/api/admin/courses/${id}/modules/${moduleId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast("success", "Deleted", "Module removed.");
      setExpandedModules((prev) => { const next = new Set(prev); next.delete(moduleId); return next; });
      await fetchCourse();
    } catch {
      toast("error", "Delete failed", "Could not delete module.");
    } finally {
      setDeletingModule(null);
    }
  };

  const handleModuleOrder = async (moduleId: string, direction: "up" | "down") => {
    if (!course) return;
    const modules = [...course.modules].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = modules.findIndex((m) => m.id === moduleId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= modules.length) return;

    const a = modules[idx];
    const b = modules[swapIdx];
    if (!a || !b) return;

    try {
      await Promise.all([
        fetch(`/api/admin/courses/${id}/modules/${a.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: b.sortOrder }),
        }),
        fetch(`/api/admin/courses/${id}/modules/${b.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: a.sortOrder }),
        }),
      ]);
      await fetchCourse();
    } catch {
      toast("error", "Reorder failed", "Could not reorder modules.");
    }
  };

  // ── Lesson CRUD ───────────────────────────────────────────────────────────

  const openCreateLesson = (moduleId: string) => {
    const mod = course?.modules.find((m) => m.id === moduleId);
    setLessonForm({ title: "", description: "", type: "VIDEO", videoUrl: "", pdfUrl: "", sortOrder: mod?.lessons.length ?? 0 });
    setLessonModal({ open: true, moduleId, editingId: null });
  };

  const openEditLesson = (moduleId: string, lesson: Lesson) => {
    setLessonForm({
      title: lesson.title, description: lesson.description, type: lesson.type,
      videoUrl: lesson.videoUrl, pdfUrl: lesson.pdfUrl, sortOrder: lesson.sortOrder,
    });
    setLessonModal({ open: true, moduleId, editingId: lesson.id });
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim()) { toast("error", "Validation", "Lesson title is required."); return; }
    setSavingLesson(true);
    try {
      const isEdit = !!lessonModal.editingId;
      const url = isEdit
        ? `/api/admin/courses/${id}/modules/${lessonModal.moduleId}/lessons/${lessonModal.editingId}`
        : `/api/admin/courses/${id}/modules/${lessonModal.moduleId}/lessons`;
      const payload = {
        title: lessonForm.title,
        description: lessonForm.description,
        type: lessonForm.type,
        videoUrl: lessonForm.type === "VIDEO" ? lessonForm.videoUrl : "",
        pdfUrl: lessonForm.type === "PDF" ? lessonForm.pdfUrl : "",
        sortOrder: Number(lessonForm.sortOrder) || 0,
      };
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      toast("success", isEdit ? "Updated" : "Created", `Lesson "${lessonForm.title}" saved.`);
      setLessonModal({ open: false, moduleId: "", editingId: null });
      await fetchCourse();
    } catch (e: unknown) {
      toast("error", "Save failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    setDeletingLesson({ moduleId, lessonId });
    try {
      const res = await fetch(`/api/admin/courses/${id}/modules/${moduleId}/lessons/${lessonId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast("success", "Deleted", "Lesson removed.");
      await fetchCourse();
    } catch {
      toast("error", "Delete failed", "Could not delete lesson.");
    } finally {
      setDeletingLesson(null);
    }
  };

  const handleLessonOrder = async (moduleId: string, lessonId: string, direction: "up" | "down") => {
    if (!course) return;
    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const lessons = [...mod.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = lessons.findIndex((l) => l.id === lessonId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= lessons.length) return;

    const a = lessons[idx];
    const b = lessons[swapIdx];
    if (!a || !b) return;

    try {
      await Promise.all([
        fetch(`/api/admin/courses/${id}/modules/${moduleId}/lessons/${a.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: b.sortOrder }),
        }),
        fetch(`/api/admin/courses/${id}/modules/${moduleId}/lessons/${b.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: a.sortOrder }),
        }),
      ]);
      await fetchCourse();
    } catch {
      toast("error", "Reorder failed", "Could not reorder lessons.");
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <PageHeader title="Edit Course" description="Loading course data..." />
        <div className="mx-auto max-w-3xl space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-40 animate-pulse rounded-lg bg-muted" /></CardContent></Card>
          ))}
        </div>
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell>
        <PageHeader title="Edit Course" description="Course not found." />
        <Card className="mx-auto max-w-3xl p-8 text-center">
          <p className="text-muted-foreground">The requested course could not be loaded.</p>
          <Link href="/admin/courses"><Button variant="ghost" className="mt-4"><ArrowLeft className="h-4 w-4" /> Back to Courses</Button></Link>
        </Card>
      </DashboardShell>
    );
  }

  const sortedModules = [...course.modules].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <DashboardShell>
      <PageHeader
        title={`Edit: ${course.title}`}
        description="Update course details, manage modules and lessons."
        actions={
          <div className="flex gap-2">
            <Link href="/admin/courses">
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back</Button>
            </Link>
            <Link href={`/admin/courses/${id}/upload`}>
              <Button variant="outline" size="sm">Upload Content</Button>
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Course Info Form */}
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="title">
                <Input id="title" value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
              </Field>
              <Field label="Slug" htmlFor="slug">
                <Input id="slug" value={form.slug} onChange={(e) => { setSlugEdited(true); updateForm("slug", e.target.value); }} />
              </Field>
            </div>
            <Field label="Description" htmlFor="description">
              <Textarea id="description" value={form.description} onChange={(e) => updateForm("description", e.target.value)} rows={4} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" htmlFor="category">
                <Select id="category" value={form.category} onChange={(e) => updateForm("category", e.target.value)}>
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Level" htmlFor="level">
                <Select id="level" value={form.level} onChange={(e) => updateForm("level", e.target.value)}>
                  {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Duration" htmlFor="duration">
                <Input id="duration" value={form.duration} onChange={(e) => updateForm("duration", e.target.value)} placeholder="8 weeks" />
              </Field>
              <Field label="Price (₹)" htmlFor="price">
                <Input id="price" type="number" min={0} value={form.price} onChange={(e) => updateForm("price", Number(e.target.value))} />
              </Field>
              <Field label="Status" htmlFor="status">
                <Select id="status" value={form.status} onChange={(e) => updateForm("status", e.target.value)}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Thumbnail URL" htmlFor="thumbnail">
                <Input id="thumbnail" value={form.thumbnailUrl} onChange={(e) => updateForm("thumbnailUrl", e.target.value)} placeholder="https://..." />
              </Field>
              <Field label="Banner URL" htmlFor="banner">
                <Input id="banner" value={form.bannerUrl} onChange={(e) => updateForm("bannerUrl", e.target.value)} placeholder="https://..." />
              </Field>
            </div>
            <Field label="Sort Order" htmlFor="sortOrder">
              <Input id="sortOrder" type="number" min={0} value={form.sortOrder} onChange={(e) => updateForm("sortOrder", Number(e.target.value))} className="max-w-[120px]" />
            </Field>
            <div className="flex justify-end pt-2">
              <Button variant="gradient" loading={savingCourse} onClick={handleSaveCourse}>
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modules Section */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Modules & Lessons</CardTitle>
            <Button variant="gradient" size="sm" onClick={openCreateModule}>
              <Plus className="h-4 w-4" /> Add Module
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedModules.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">No modules yet. Add your first module to start organizing lessons.</p>
              </div>
            ) : (
              sortedModules.map((mod, modIdx) => {
                const isExpanded = expandedModules.has(mod.id);
                const sortedLessons = [...mod.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
                return (
                  <div key={mod.id} className="rounded-lg border border-border">
                    {/* Module Header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-muted/30">
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{mod.title}</p>
                        <p className="text-xs text-muted-foreground">{sortedLessons.length} lesson{sortedLessons.length !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={modIdx === 0}
                          onClick={() => handleModuleOrder(mod.id, "up")}
                          title="Move up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={modIdx === sortedModules.length - 1}
                          onClick={() => handleModuleOrder(mod.id, "down")}
                          title="Move down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditModule(mod)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteModule(mod.id)}
                          loading={deletingModule === mod.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>

                    {/* Lessons List */}
                    {isExpanded && (
                      <div className="border-t border-border">
                        {sortedLessons.length === 0 ? (
                          <div className="px-4 py-6 text-center">
                            <p className="text-sm text-muted-foreground">No lessons in this module.</p>
                            <Button variant="ghost" size="sm" className="mt-2" onClick={() => openCreateLesson(mod.id)}>
                              <Plus className="h-3.5 w-3.5" /> Add Lesson
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-8"></TableHead>
                                  <TableHead>Title</TableHead>
                                  <TableHead>Type</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sortedLessons.map((lesson, lessonIdx) => (
                                  <TableRow key={lesson.id}>
                                    <TableCell>
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {lesson.type === "VIDEO"
                                          ? <FileVideo className="h-4 w-4 text-blue-500" />
                                          : <FileText className="h-4 w-4 text-red-500" />}
                                        <div>
                                          <p className="font-medium">{lesson.title}</p>
                                          {lesson.description && (
                                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">{lesson.description}</p>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{lesson.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          disabled={lessonIdx === 0}
                                          onClick={() => handleLessonOrder(mod.id, lesson.id, "up")}
                                        >
                                          <ChevronUp className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          disabled={lessonIdx === sortedLessons.length - 1}
                                          onClick={() => handleLessonOrder(mod.id, lesson.id, "down")}
                                        >
                                          <ChevronDown className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => openEditLesson(mod.id, lesson)}>
                                          <Pencil className="h-3.5 w-3.5" /> Edit
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-destructive hover:text-destructive"
                                          onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                                          loading={deletingLesson?.moduleId === mod.id && deletingLesson?.lessonId === lesson.id}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" /> Delete
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <div className="px-4 py-2 border-t border-border">
                              <Button variant="ghost" size="sm" onClick={() => openCreateLesson(mod.id)}>
                                <Plus className="h-3.5 w-3.5" /> Add Lesson
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Modal */}
      <Modal
        open={moduleModal.open}
        onClose={() => setModuleModal({ open: false, editingId: null })}
        title={moduleModal.editingId ? "Edit Module" : "Add Module"}
      >
        <div className="space-y-4">
          <Field label="Title" htmlFor="mod-title">
            <Input id="mod-title" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} placeholder="e.g. Getting Started" />
          </Field>
          <Field label="Description" htmlFor="mod-desc">
            <Textarea id="mod-desc" value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} rows={3} placeholder="Brief module description..." />
          </Field>
          <Field label="Sort Order" htmlFor="mod-order">
            <Input id="mod-order" type="number" min={0} value={moduleForm.sortOrder} onChange={(e) => setModuleForm({ ...moduleForm, sortOrder: Number(e.target.value) })} className="max-w-[120px]" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModuleModal({ open: false, editingId: null })}>Cancel</Button>
            <Button variant="gradient" loading={savingModule} onClick={handleSaveModule}>
              <Save className="h-4 w-4" /> {moduleModal.editingId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lesson Modal */}
      <Modal
        open={lessonModal.open}
        onClose={() => setLessonModal({ open: false, moduleId: "", editingId: null })}
        title={lessonModal.editingId ? "Edit Lesson" : "Add Lesson"}
      >
        <div className="space-y-4">
          <Field label="Title" htmlFor="les-title">
            <Input id="les-title" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="e.g. Introduction to React" />
          </Field>
          <Field label="Description" htmlFor="les-desc">
            <Textarea id="les-desc" value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} rows={3} placeholder="Lesson overview..." />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor="les-type">
              <Select id="les-type" value={lessonForm.type} onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as "VIDEO" | "PDF" })}>
                {LESSON_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Sort Order" htmlFor="les-order">
              <Input id="les-order" type="number" min={0} value={lessonForm.sortOrder} onChange={(e) => setLessonForm({ ...lessonForm, sortOrder: Number(e.target.value) })} />
            </Field>
          </div>
          {lessonForm.type === "VIDEO" && (
            <Field label="Video URL" htmlFor="les-video" hint="Cloudinary, Google Drive, or direct video URL">
              <Input id="les-video" value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} placeholder="https://..." />
            </Field>
          )}
          {lessonForm.type === "PDF" && (
            <Field label="PDF URL" htmlFor="les-pdf" hint="Cloudinary or direct PDF URL">
              <Input id="les-pdf" value={lessonForm.pdfUrl} onChange={(e) => setLessonForm({ ...lessonForm, pdfUrl: e.target.value })} placeholder="https://..." />
            </Field>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setLessonModal({ open: false, moduleId: "", editingId: null })}>Cancel</Button>
            <Button variant="gradient" loading={savingLesson} onClick={handleSaveLesson}>
              <Save className="h-4 w-4" /> {lessonModal.editingId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  );
}
