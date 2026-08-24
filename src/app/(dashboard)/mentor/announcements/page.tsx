"use client";

import { useEffect, useState } from "react";
import { Megaphone, Pin } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { getAnnouncementsForUser, postAnnouncement } from "@/lib/data/repository";
import { formatDate, timeAgo } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

export default function MentorAnnouncementsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ title: "", body: "" });
  const [pinned, setPinned] = useState(false);
  const [posts, setPosts] = useState(0);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const announcements = getAnnouncementsForUser(user.id);

  const handlePost = () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast("error", "Missing fields", "Add a title and message.");
      return;
    }
    postAnnouncement({
      title: form.title.trim(),
      body: form.body.trim(),
      audience: [],
      author: user.name,
      pinned,
    });
    setForm({ title: "", body: "" });
    setPinned(false);
    setPosts((p) => p + 1);
    toast("success", "Announcement posted", "All assigned interns have been notified.");
  };

  return (
    <DashboardShell>
      <PageHeader title="Announcements" description="Post updates — interns see them on their dashboard and via notification." />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-brand-500" /> New announcement</CardTitle>
          <CardDescription>Appears instantly in interns&apos; dashboards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Week 3 resources are live" />
          </Field>
          <Field label="Message">
            <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Details of the announcement…" />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="h-4 w-4 accent-brand-600" />
              Pin to top
            </label>
            <Button variant="gradient" onClick={handlePost}>Post announcement</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {[...announcements.slice(0, posts + announcements.length)].map((a) => (
          <Card key={a.id}>
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {a.pinned && <Pin className="h-4 w-4 text-brand-500" />}
                  <h3 className="font-semibold">{a.title}</h3>
                </div>
                <Badge variant="outline">{timeAgo(a.createdAt)}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
              <p className="mt-3 text-xs text-muted-foreground">Posted by {a.author} · {formatDate(a.createdAt)}</p>
            </div>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
