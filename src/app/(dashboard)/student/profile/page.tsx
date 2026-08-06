"use client";

import { useEffect, useState } from "react";
import { UserRound, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { getSession, demoSaveProfile, demoGetProfile } from "@/lib/auth";
import { getApplicationByUser, submitApplication } from "@/lib/data/repository";
import { ROLE_LABEL } from "@/lib/rbac";
import type { AppUser, Profile } from "@/lib/types";

export default function StudentProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ mobile: "", college: "", course: "", yearOfStudy: "", linkedin: "", github: "", bio: "" });

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      const app = user ? getApplicationByUser(user.id) : undefined;
      const stored = user ? demoGetProfile(user.id) ?? {} : {};
      const p: Partial<Profile> = app?.profile ?? stored;
      setForm({
        mobile: p.mobile ?? "",
        college: p.college ?? "",
        course: p.course ?? "",
        yearOfStudy: p.yearOfStudy ?? "",
        linkedin: p.linkedin ?? "",
        github: p.github ?? "",
        bio: p.bio ?? "",
      });
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const app = getApplicationByUser(user.id);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!user) return;
    demoSaveProfile(user.id, { ...form });
    if (app) {
      submitApplication({ ...app, profile: { ...app.profile, ...form } });
    }
    toast("success", "Profile updated", "Your changes are saved.");
  };

  return (
    <DashboardShell>
      <PageHeader title="My profile" description="Keep your details up to date — they're used for verification and your certificate." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit p-6 text-center">
          <div className="flex justify-center"><Avatar name={user.name} className="h-20 w-20 text-xl" /></div>
          <h2 className="mt-4 text-lg font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-3 flex justify-center gap-2">
            <Badge variant="primary">{ROLE_LABEL[user.role]}</Badge>
            {app && <Badge variant={app.status === "approved" ? "success" : "warning"}>{app.status.replace("_", " ")}</Badge>}
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> Email verified
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserRound className="h-4 w-4 text-brand-500" /> Academic & professional details</CardTitle>
            <CardDescription>Used by admins for application review and certificate generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mobile number">
                <Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+91 …" />
              </Field>
              <Field label="Year of study">
                <Input value={form.yearOfStudy} onChange={(e) => set("yearOfStudy", e.target.value)} placeholder="3rd Year" />
              </Field>
              <Field label="College / University">
                <Input value={form.college} onChange={(e) => set("college", e.target.value)} placeholder="College name" />
              </Field>
              <Field label="Course">
                <Input value={form.course} onChange={(e) => set("course", e.target.value)} placeholder="B.Tech CSE" />
              </Field>
              <Field label="LinkedIn">
                <Input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/you" />
              </Field>
              <Field label="GitHub">
                <Input value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="github.com/you" />
              </Field>
            </div>
            <Field label="Bio (shown to mentors)">
              <textarea
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="A line or two about you and your goals…"
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => toast("info", "Nothing to reset")}>Reset</Button>
              <Button variant="gradient" onClick={handleSave}>Save changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
