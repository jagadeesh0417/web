"use client";

import { useEffect, useState } from "react";
import { Video, CalendarPlus, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { getSessions } from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";

export default function MentorSessionsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", durationMin: "60", link: "", description: "" });

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const sessions = getSessions();

  const createSession = () => {
    if (!form.title || !form.date || !form.time) {
      toast("error", "Missing fields", "Title, date and time are required.");
      return;
    }
    setCreating(false);
    toast("success", "Session scheduled", "Interns will get a notification and email reminder.");
    setForm({ title: "", date: "", time: "", durationMin: "60", link: "", description: "" });
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Live sessions"
        description="Schedule and manage your cohort's live sessions."
        actions={
          <Button variant="gradient" size="sm" onClick={() => setCreating(!creating)}>
            <CalendarPlus className="h-4 w-4" /> New session
          </Button>
        }
      />

      {creating && (
        <Card className="mb-6 border-brand-500/40">
          <CardHeader>
            <CardTitle>Schedule a live session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Session title">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="React Deep Dive" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Date">
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
              <Field label="Time">
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </Field>
              <Field label="Duration (min)">
                <Input type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} />
              </Field>
            </div>
            <Field label="Meet link">
              <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://meet.google.com/…" />
            </Field>
            <Field label="Description">
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will this session cover?" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
              <Button variant="gradient" onClick={createSession}>Schedule</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {sessions.map((s) => (
          <Card key={s.id}>
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                <Video className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{s.title}</h2>
                  <Badge variant={s.date >= new Date().toISOString().slice(0, 10) ? "success" : "default"}>
                    {s.date >= new Date().toISOString().slice(0, 10) ? "Upcoming" : "Completed"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(s.date)} · {s.time} · {s.durationMin} min</p>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{s.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a href={s.link} target="_blank" rel="noreferrer"><Button variant="outline" size="sm">Open link</Button></a>
                <Button variant="ghost" size="icon" onClick={() => toast("info", "Session removed")} aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
