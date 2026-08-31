"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Video, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, HelpCircle,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { Video as VideoType, Module } from "@/lib/types";

type VideoForm = {
  title: string;
  description: string;
  driveUrl: string;
  moduleId: string;
  lessonOrder: string;
  duration: string;
  status: "draft" | "published";
};

const emptyForm: VideoForm = {
  title: "",
  description: "",
  driveUrl: "",
  moduleId: "",
  lessonOrder: "0",
  duration: "",
  status: "draft",
};

export default function AdminVideosPage() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VideoForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [videosRes, modulesRes] = await Promise.all([
        fetch("/api/admin/videos"),
        fetch("/api/admin/modules"),
      ]);
      const videosData = await videosRes.json();
      const modulesData = await modulesRes.json();
      setVideos(videosData.videos ?? []);
      setModules(Array.isArray(modulesData) ? modulesData : []);
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

  const moduleMap = useMemo(() => {
    const map: Record<string, Module> = {};
    for (const m of modules) map[m.id] = m;
    return map;
  }, [modules]);

  const groupedVideos = useMemo(() => {
    const groups: Record<string, VideoType[]> = {};
    for (const v of videos) {
      const key = v.moduleId || "_unassigned";
      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    }
    return groups;
  }, [videos]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowCreate(false);
  };

  const startEdit = (video: VideoType) => {
    setForm({
      title: video.title,
      description: video.description,
      driveUrl: video.driveUrl,
      moduleId: video.moduleId,
      lessonOrder: String(video.lessonOrder),
      duration: video.duration ?? "",
      status: video.status,
    });
    setEditingId(video.id);
    setShowCreate(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast("error", "Title is required");
      return;
    }
    if (!form.driveUrl.trim()) {
      toast("error", "Google Drive URL is required");
      return;
    }
    if (!form.moduleId) {
      toast("error", "Module is required");
      return;
    }

    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        driveUrl: form.driveUrl.trim(),
        moduleId: form.moduleId,
        lessonOrder: Number(form.lessonOrder) || 0,
        duration: form.duration.trim() || undefined,
        status: form.status,
      };

      const res = editingId
        ? await fetch(`/api/admin/videos/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/admin/videos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const data = await res.json();
        toast("error", data.error ?? "Failed to save video");
        return;
      }

      toast("success", editingId ? "Video updated" : "Video created");
      resetForm();
      await fetchData();
    } catch {
      toast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (video: VideoType) => {
    const newStatus = video.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        toast("error", "Failed to update status");
        return;
      }
      toast("success", `Video ${newStatus === "published" ? "published" : "unpublished"}`);
      await fetchData();
    } catch {
      toast("error", "Network error");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/videos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("error", "Failed to delete video");
        return;
      }
      toast("success", "Video deleted");
      setConfirmDeleteId(null);
      await fetchData();
    } catch {
      toast("error", "Network error");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <PageHeader title="Video Lessons" description="Manage Google Drive video lessons for your modules." />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Video Lessons"
        description="Manage Google Drive video lessons for your modules."
        actions={
          <Button variant="gradient" size="sm" onClick={() => { resetForm(); setShowCreate(true); }}>
            <Plus className="h-4 w-4" /> Add Video
          </Button>
        }
      />

      {/* Google Drive Help */}
      <Card className="mb-6 border-sky-500/30 bg-sky-500/5">
        <CardContent className="flex items-start gap-3 p-4">
          <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-sky-700 dark:text-sky-300">Google Drive Help</p>
            <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
              <li>Upload your video to Google Drive</li>
              <li>Right-click &rarr; Share &rarr; Change access to &ldquo;Anyone with the link&rdquo;</li>
              <li>Copy the sharing link and paste it above</li>
              <li>The system will automatically generate a playable embed link</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      {showCreate && (
        <VideoFormCard
          form={form}
          setForm={setForm}
          modules={modules}
          saving={saving}
          onSave={handleSave}
          onCancel={resetForm}
          title="Add new video"
        />
      )}

      {/* Edit Form */}
      {editingId && (
        <VideoFormCard
          form={form}
          setForm={setForm}
          modules={modules}
          saving={saving}
          onSave={handleSave}
          onCancel={resetForm}
          title="Edit video"
        />
      )}

      {/* Videos by Module */}
      {videos.length === 0 ? (
        <EmptyState
          icon={<Video className="h-10 w-10" />}
          title="No videos yet"
          description="Add your first Google Drive video lesson to get started."
          action={
            <Button variant="gradient" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> Add Video
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedVideos).map(([moduleId, group]) => {
            const mod = moduleMap[moduleId];
            return (
              <Card key={moduleId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {mod ? mod.title : "Unassigned"}
                    <Badge variant="outline">{group.length} video{group.length !== 1 ? "s" : ""}</Badge>
                  </CardTitle>
                  {mod && (
                    <CardDescription>
                      Week {mod.week} &middot; {mod.categorySlug}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                          <th className="pb-2 pr-4">Title</th>
                          <th className="pb-2 pr-4">Module</th>
                          <th className="pb-2 pr-4">Order</th>
                          <th className="pb-2 pr-4">Duration</th>
                          <th className="pb-2 pr-4">Status</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group
                          .sort((a, b) => a.lessonOrder - b.lessonOrder)
                          .map((video) => (
                            <tr key={video.id} className="border-b border-border last:border-0">
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{video.title}</span>
                                  {video.embedUrl && (
                                    <a
                                      href={video.embedUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-muted-foreground hover:text-foreground"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                </div>
                                {video.description && (
                                  <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">
                                    {video.description}
                                  </p>
                                )}
                              </td>
                              <td className="py-3 pr-4 text-xs text-muted-foreground">
                                {mod?.title ?? video.moduleId}
                              </td>
                              <td className="py-3 pr-4 text-xs">{video.lessonOrder}</td>
                              <td className="py-3 pr-4 text-xs text-muted-foreground">
                                {video.duration ?? "—"}
                              </td>
                              <td className="py-3 pr-4">
                                <Badge variant={video.status === "published" ? "success" : "warning"}>
                                  {video.status}
                                </Badge>
                              </td>
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title={video.status === "published" ? "Unpublish" : "Publish"}
                                    onClick={() => handleToggleStatus(video)}
                                  >
                                    {video.status === "published" ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Edit"
                                    onClick={() => startEdit(video)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  {confirmDeleteId === video.id ? (
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(video.id)}
                                        loading={deletingId === video.id}
                                      >
                                        Confirm
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setConfirmDeleteId(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Delete"
                                      onClick={() => setConfirmDeleteId(video.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}

function VideoFormCard({
  form,
  setForm,
  modules,
  saving,
  onSave,
  onCancel,
  title,
}: {
  form: VideoForm;
  setForm: (fn: (prev: VideoForm) => VideoForm) => void;
  modules: Module[];
  saving: boolean;
  onSave: () => void;
  onCancel: () => void;
  title: string;
}) {
  return (
    <Card className="mb-6 border-brand-500/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-4 w-4 text-brand-500" /> {title}
        </CardTitle>
        <CardDescription>
          Paste a Google Drive sharing link. The system extracts the file ID and creates a playable embed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Introduction to HTML"
            />
          </Field>
          <Field label="Module">
            <Select
              value={form.moduleId}
              onChange={(e) => setForm((f) => ({ ...f, moduleId: e.target.value }))}
            >
              <option value="">Select a module</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  Week {m.week} — {m.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Google Drive URL"
            hint="Paste Google Drive sharing link. File must be shared with 'Anyone with the link'."
          >
            <Input
              value={form.driveUrl}
              onChange={(e) => setForm((f) => ({ ...f, driveUrl: e.target.value }))}
              placeholder="https://drive.google.com/file/d/..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Lesson Order">
              <Input
                type="number"
                min={0}
                value={form.lessonOrder}
                onChange={(e) => setForm((f) => ({ ...f, lessonOrder: e.target.value }))}
              />
            </Field>
            <Field label="Duration" hint="Optional">
              <Input
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                placeholder="e.g. 12 min"
              />
            </Field>
          </div>
        </div>
        <Field label="Description">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of this video lesson"
          />
        </Field>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Status</span>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={form.status === "draft"}
              onChange={() => setForm((f) => ({ ...f, status: "draft" }))}
              className="accent-brand-500"
            />
            Draft
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="status"
              value="published"
              checked={form.status === "published"}
              onChange={() => setForm((f) => ({ ...f, status: "published" }))}
              className="accent-brand-500"
            />
            Published
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="gradient" onClick={onSave} loading={saving}>
            {title.startsWith("Edit") ? "Save changes" : "Create video"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
