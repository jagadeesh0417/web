"use client";

import { useEffect, useState } from "react";
import { Quote, Plus, Star, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { getTestimonials, saveTestimonial } from "@/lib/data/repository";
import { generateId } from "@/lib/utils";
import type { Testimonial } from "@/lib/types";

export default function AdminTestimonialsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", role: "", quote: "", rating: "5" });

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
      setItems(getTestimonials());
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const add = () => {
    if (!form.name.trim() || !form.quote.trim()) {
      toast("error", "Missing fields", "Name and quote are required.");
      return;
    }
    const t: Testimonial = {
      id: generateId("t"),
      name: form.name.trim(),
      company: form.company.trim() || "Akradhii",
      role: form.role.trim() || "Client",
      quote: form.quote.trim(),
      rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
      initials: form.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(),
      gradient: "from-violet-600 to-indigo-600",
    };
    saveTestimonial(t);
    setItems(getTestimonials());
    setAdding(false);
    setForm({ name: "", company: "", role: "", quote: "", rating: "5" });
    toast("success", "Testimonial added", "It now appears on the homepage.");
  };

  const remove = (id: string) => {
    toast("info", "Feature", `Testimonial ${id} can be archived from the data layer in production.`);
  };

  const columns: Column<Testimonial>[] = [
    {
      key: "name",
      header: "Person",
      cell: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.role} · {r.company}</p>
        </div>
      ),
    },
    {
      key: "quote",
      header: "Quote",
      cell: (r) => <p className="max-w-md truncate text-sm text-muted-foreground">&ldquo;{r.quote}&rdquo;</p>,
    },
    {
      key: "rating",
      header: "Rating",
      cell: (r) => (
        <span className="flex gap-0.5 text-warning">
          {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (r) => <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>,
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Testimonials"
        description="Client and intern reviews shown on the homepage."
        actions={<Button variant="gradient" size="sm" onClick={() => setAdding(!adding)}><Plus className="h-4 w-4" /> Add testimonial</Button>}
      />

      {adding && (
        <Card className="mb-6 border-brand-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Quote className="h-4 w-4 text-brand-500" /> New testimonial</CardTitle>
            <CardDescription>Keep it specific — concrete numbers perform best.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Role"><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Founder" /></Field>
              <Field label="Company"><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
            </div>
            <Field label="Quote">
              <Textarea value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
            </Field>
            <Field label="Rating (1-5)">
              <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
              <Button variant="gradient" onClick={add}>Add testimonial</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable data={items} columns={columns} searchPlaceholder="Search testimonials…" searchKeys={["name", "company", "quote"]} pageSize={6} />
    </DashboardShell>
  );
}
