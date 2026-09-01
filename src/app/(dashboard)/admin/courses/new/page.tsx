"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils";

const CATEGORY_OPTIONS = [
  "Web Development",
  "Digital Marketing",
  "UI/UX Design",
  "Data Science",
  "Mobile Development",
  "Cybersecurity",
  "Cloud Computing",
];

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const STATUS_OPTIONS = ["DRAFT", "PUBLISHED"];

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

const defaults: CourseForm = {
  title: "",
  slug: "",
  description: "",
  thumbnailUrl: "",
  bannerUrl: "",
  category: "",
  duration: "",
  level: "Beginner",
  price: 0,
  status: "DRAFT",
  sortOrder: 0,
};

export default function NewCoursePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<CourseForm>(defaults);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (!slugEdited) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title, slugEdited]);

  const update = <K extends keyof CourseForm>(key: K, value: CourseForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast("error", "Validation", "Title is required.");
      return;
    }
    if (!form.slug.trim()) {
      toast("error", "Validation", "Slug is required.");
      return;
    }
    if (!form.category) {
      toast("error", "Validation", "Please select a category.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price) || 0,
          sortOrder: Number(form.sortOrder) || 0,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Request failed");
      }
      const data = await res.json();
      toast("success", "Created", `"${form.title}" has been created.`);
      router.push(`/admin/courses/${data.id}`);
    } catch (e: unknown) {
      toast("error", "Create failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Create Course"
        description="Add a new course to the platform."
        actions={
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back to Courses</Button>
          </Link>
        }
      />

      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="title" hint="Course display name">
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Complete Web Development Bootcamp"
                />
              </Field>

              <Field label="Slug" htmlFor="slug" hint="URL-friendly identifier">
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => { setSlugEdited(true); update("slug", e.target.value); }}
                  placeholder="complete-web-development-bootcamp"
                />
              </Field>
            </div>

            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe what students will learn..."
                rows={4}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" htmlFor="category">
                <Select id="category" value={form.category} onChange={(e) => update("category", e.target.value)}>
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Level" htmlFor="level">
                <Select id="level" value={form.level} onChange={(e) => update("level", e.target.value)}>
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Duration" htmlFor="duration" hint="e.g. 8 weeks">
                <Input
                  id="duration"
                  value={form.duration}
                  onChange={(e) => update("duration", e.target.value)}
                  placeholder="8 weeks"
                />
              </Field>

              <Field label="Price (₹)" htmlFor="price">
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => update("price", Number(e.target.value))}
                />
              </Field>

              <Field label="Status" htmlFor="status">
                <Select id="status" value={form.status} onChange={(e) => update("status", e.target.value)}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Thumbnail URL" htmlFor="thumbnail" hint="Cover image for the course">
                <Input
                  id="thumbnail"
                  value={form.thumbnailUrl}
                  onChange={(e) => update("thumbnailUrl", e.target.value)}
                  placeholder="https://..."
                />
              </Field>

              <Field label="Banner URL" htmlFor="banner" hint="Wide banner image">
                <Input
                  id="banner"
                  value={form.bannerUrl}
                  onChange={(e) => update("bannerUrl", e.target.value)}
                  placeholder="https://..."
                />
              </Field>
            </div>

            <Field label="Sort Order" htmlFor="sortOrder" hint="Controls display position">
              <Input
                id="sortOrder"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => update("sortOrder", Number(e.target.value))}
                className="max-w-[120px]"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/admin/courses">
                <Button variant="secondary">Cancel</Button>
              </Link>
              <Button variant="gradient" loading={saving} onClick={handleSubmit}>
                <Save className="h-4 w-4" /> Create Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
