"use client";

import { useEffect, useState } from "react";
import { Clock, Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { getTimesheetsForEmployee, getProjects } from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";

export default function TimesheetsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ date: "", hours: "8", projectName: "", note: "" });

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const timesheets = getTimesheetsForEmployee(user.id);
  const projects = getProjects();
  const totalHours = timesheets.reduce((a, t) => a + t.hours, 0);
  const approvedHours = timesheets.filter((t) => t.approved).reduce((a, t) => a + t.hours, 0);

  const submit = () => {
    if (!form.date || !form.projectName) {
      toast("error", "Missing fields", "Date and project are required.");
      return;
    }
    setAdding(false);
    setForm({ date: "", hours: "8", projectName: "", note: "" });
    toast("success", "Timesheet entry added", "Pending manager approval.");
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Timesheets"
        description="Log your hours per project — entries go to admin for approval."
        actions={
          <Button variant="gradient" size="sm" onClick={() => setAdding(!adding)}>
            <Plus className="h-4 w-4" /> Log hours
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-muted-foreground">Total logged</p><p className="mt-1 text-2xl font-extrabold">{totalHours}h</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Approved</p><p className="mt-1 text-2xl font-extrabold text-success">{approvedHours}h</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Pending approval</p><p className="mt-1 text-2xl font-extrabold text-warning">{totalHours - approvedHours}h</p></Card>
      </div>

      {adding && (
        <Card className="mb-6 border-brand-500/40">
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-500" /> Log hours</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Hours"><Input type="number" min={0.5} max={16} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></Field>
              <Field label="Project">
                <CustomSelect
                  options={projects.map((p) => ({ value: p.name, label: p.name }))}
                  value={form.projectName}
                  onChange={(v) => setForm({ ...form, projectName: v })}
                  placeholder="Select project"
                />
              </Field>
            </div>
            <Field label="Note">
              <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What did you work on?" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
              <Button variant="gradient" onClick={submit}>Add entry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {timesheets.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">{t.projectName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(t.date)} · {t.note || "—"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{t.hours}h</span>
                <Badge variant={t.approved ? "success" : "warning"}>{t.approved ? "Approved" : "Pending"}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
