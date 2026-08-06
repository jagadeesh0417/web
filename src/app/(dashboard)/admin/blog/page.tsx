"use client";

import { useEffect, useState } from "react";
import { PenLine, Plus, Eye, EyeOff, Pencil } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { getBlogPosts, saveBlogPost } from "@/lib/data/repository";
import { formatDate, generateId } from "@/lib/utils";
import { slugify } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";

export default function AdminBlogPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string; name?: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | "new" | null>(null);
  const [form, setForm] = useState({ title: "", excerpt: "", category: "", author: "", content: "", tags: "" });

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
      setPosts(getBlogPosts());
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const openEditor = (post: BlogPost | "new") => {
    if (post === "new") {
      setForm({ title: "", excerpt: "", category: "Growth", author: user.name ?? "Akradhii Team", content: "", tags: "" });
    } else {
      setForm({ title: post.title, excerpt: post.excerpt, category: post.category, author: post.author, content: post.content.join("\n\n"), tags: post.tags.join(", ") });
    }
    setEditing(post);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.excerpt.trim()) {
      toast("error", "Missing fields", "Title and excerpt are required.");
      return;
    }
    const existing = editing !== "new" && editing ? editing : undefined;
    const post: BlogPost = {
      id: existing?.id ?? generateId("b"),
      slug: existing?.slug ?? slugify(form.title),
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      author: form.author.trim() || user.name || "Akradhii Team",
      category: form.category.trim() || "Growth",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      readingTime: Math.max(1, Math.round(form.content.split(/\s+/).length / 200)),
      publishedAt: existing?.publishedAt ?? new Date().toISOString(),
      published: existing?.published ?? true,
      gradient: existing?.gradient ?? "from-violet-600 to-indigo-600",
      content: form.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    };
    saveBlogPost(post);
    setPosts(getBlogPosts());
    setEditing(null);
    toast("success", "Post saved", existing ? "Updated and published." : "New post created.");
  };

  const togglePublish = (post: BlogPost) => {
    saveBlogPost({ ...post, published: !post.published });
    setPosts(getBlogPosts());
    toast("success", !post.published ? "Published" : "Unpublished", post.title);
  };

  const columns: Column<BlogPost>[] = [
    {
      key: "title",
      header: "Title",
      cell: (r) => (
        <div>
          <p className="font-medium">{r.title}</p>
          <p className="text-xs text-muted-foreground">/{r.slug}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (r) => <Badge variant="primary">{r.category}</Badge>,
    },
    {
      key: "readingTime",
      header: "Read",
      cell: (r) => <span className="text-sm">{r.readingTime} min</span>,
    },
    {
      key: "publishedAt",
      header: "Published",
      cell: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.publishedAt)}</span>,
    },
    {
      key: "published",
      header: "Status",
      cell: (r) => <Badge variant={r.published ? "success" : "outline"}>{r.published ? "Live" : "Draft"}</Badge>,
    },
    {
      key: "actions",
      header: "",
      cell: (r) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEditor(r)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => togglePublish(r)}>{r.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Blog"
        description="Write, edit and publish articles for the marketing site."
        actions={<Button variant="gradient" size="sm" onClick={() => openEditor("new")}><Plus className="h-4 w-4" /> New post</Button>}
      />

      {editing && (
        <Card className="mb-6 border-brand-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PenLine className="h-4 w-4 text-brand-500" /> {editing === "new" ? "New post" : "Edit post"}</CardTitle>
            <CardDescription>Changes go live immediately when saved as published.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Title">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Excerpt">
              <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Category">
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </Field>
              <Field label="Author">
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </Field>
              <Field label="Tags (comma separated)">
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </Field>
            </div>
            <Field label="Content (paragraphs separated by blank lines)">
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="min-h-[200px]" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button variant="gradient" onClick={handleSave}>Save post</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable data={posts} columns={columns} searchPlaceholder="Search posts…" searchKeys={["title", "category", "author"]} pageSize={6} />
    </DashboardShell>
  );
}
