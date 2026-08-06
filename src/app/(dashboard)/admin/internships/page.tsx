"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Pencil } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { PROGRAMS, CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function AdminInternshipsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"programs" | "categories">("programs");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast("error", "Name required", "Give the program or category a name.");
      return;
    }
    toast("success", "Created", `${form.name} is live. Assign a mentor and curriculum next.`);
    setForm({ name: "", description: "" });
    setCreating(false);
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Internships"
        description="Manage programs, categories, pricing and track visibility."
        actions={<Button variant="gradient" size="sm" onClick={() => setCreating(!creating)}><Plus className="h-4 w-4" /> New {tab === "programs" ? "program" : "category"}</Button>}
      />

      <div className="mb-5 inline-flex items-center gap-1 rounded-lg bg-muted p-1">
        {(["programs", "categories"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-all ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {creating && (
        <Card className="mb-6 border-brand-500/40">
          <CardHeader><CardTitle>New {tab === "programs" ? "program" : "category"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={tab === "programs" ? "e.g. Advanced Internship" : "e.g. Cloud Engineering"} />
            </Field>
            <Field label="Description">
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description shown on the site…" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
              <Button variant="gradient" onClick={handleCreate}>Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "programs" ? (
        <div className="grid gap-5 lg:grid-cols-3">
          {PROGRAMS.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{p.title}</CardTitle>
                  <Badge variant={p.featured ? "primary" : "default"}>{p.durationWeeks} weeks</Badge>
                </div>
                <CardDescription>{p.tagline}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-extrabold">{formatCurrency(p.price)}</p>
                <p className="text-xs text-muted-foreground">one-time fee</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.includes.slice(0, 4).map((inc) => <Badge key={inc} variant="outline">{inc}</Badge>)}
                </div>
                <div className="mt-4 flex gap-2 border-t border-border pt-4">
                  <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button variant={p.featured ? "success" : "ghost"} size="sm">{p.featured ? "Featured" : "Mark featured"}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{c.name}</CardTitle>
                  <Badge variant="default">{c.skills.length} skills</Badge>
                </div>
                <CardDescription className="line-clamp-2">{c.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {c.skills.slice(0, 5).map((s) => <Badge key={s} variant="primary">{s}</Badge>)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><BookOpen className="h-3.5 w-3.5" /> {c.faqs.length} FAQs · {c.learningOutcomes.length} outcomes</span>
                  <Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
