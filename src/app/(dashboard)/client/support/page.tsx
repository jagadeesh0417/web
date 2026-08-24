"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, Send } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { getTicketsForClient, openTicket } from "@/lib/data/repository";
import { submitLead } from "@/lib/leads/client";
import { formatDate, timeAgo } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

export default function ClientSupportPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: "", body: "", priority: "medium" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const tickets = getTicketsForClient(user.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!form.subject.trim() || !form.body.trim()) {
      toast("error", "Missing fields", "Subject and message are required.");
      return;
    }
    setSubmitting(true);

    openTicket({
      clientId: user.id,
      clientName: user.name,
      subject: form.subject.trim(),
      body: form.body.trim(),
      priority: form.priority as "low" | "medium" | "high",
    });

    const result = await submitLead({
      formType: "support",
      source: "Client Support Ticket",
      page: "Client Support",
      pagePath: "/client/support",
      fields: {
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        company: user.company ?? "",
        subject: form.subject.trim(),
        message: form.body.trim(),
        priority: form.priority,
        role: user.role,
        userId: user.id,
      },
    });

    setSubmitting(false);

    if (!result.ok) {
      toast("error", "Something went wrong. Please try again.", "");
      setTick((t) => t + 1);
      return;
    }

    setForm({ subject: "", body: "", priority: "medium" });
    setTick((t) => t + 1);
    toast("success", "Message Sent Successfully", "Our support team will respond within 24 hours.");
  };

  void tick;

  return (
    <DashboardShell>
      <PageHeader title="Support" description="Open a ticket and track responses from the Akradhii team." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LifeBuoy className="h-4 w-4 text-brand-500" /> Open a ticket</CardTitle>
            <CardDescription>Average first response: 4 hours on business days.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Subject">
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Staging access for content team" />
              </Field>
              <Field label="Message">
                <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Describe what you need…" />
              </Field>
              <Field label="Priority">
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
              <Button type="submit" variant="gradient" loading={submitting} disabled={submitting}>
                <Send className="h-4 w-4" /> {submitting ? "Sending..." : "Submit ticket"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your tickets ({tickets.length})</h2>
          <div className="space-y-3">
            {tickets.map((t) => (
              <Card key={t.id}>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{t.subject}</p>
                    <Badge variant={t.status === "resolved" ? "success" : t.status === "in_progress" ? "info" : "warning"}>{t.status.replace("_", " ")}</Badge>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{t.body}</p>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {t.priority} priority · {timeAgo(t.createdAt)} · opened {formatDate(t.createdAt)}
                  </p>
                </div>
              </Card>
            ))}
            {tickets.length === 0 && (
              <Card className="p-8 text-center text-sm text-muted-foreground">No tickets yet — we&apos;re all caught up.</Card>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
