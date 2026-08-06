"use client";

import { useEffect, useState } from "react";
import { UserRound, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { getSession, demoSaveProfile } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/rbac";
import type { AppUser } from "@/lib/types";

export function RoleProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ mobile: "", company: "", title: "", linkedin: "", github: "", bio: "", skills: "" });

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return null;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    demoSaveProfile(user.id, { ...form, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) });
    toast("success", "Profile updated", "Your changes are saved.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="h-fit p-6 text-center">
        <div className="flex justify-center"><Avatar name={user.name} className="h-20 w-20 text-xl" /></div>
        <h2 className="mt-4 text-lg font-bold">{user.name}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="mt-3 flex justify-center gap-2">
          <Badge variant="primary">{ROLE_LABEL[user.role]}</Badge>
          <Badge variant="success">Active</Badge>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" /> Email verified
        </p>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserRound className="h-4 w-4 text-brand-500" /> Professional details</CardTitle>
          <CardDescription>Shown to teammates and the admin team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mobile number">
              <Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+91 …" />
            </Field>
            <Field label="Title / role">
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Senior Web Engineer" />
            </Field>
            <Field label="Company (clients)">
              <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Company name" />
            </Field>
            <Field label="Skills (comma separated)">
              <Input value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, Next.js, SEO" />
            </Field>
            <Field label="LinkedIn">
              <Input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/you" />
            </Field>
            <Field label="GitHub">
              <Input value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="github.com/you" />
            </Field>
          </div>
          <Field label="Bio">
            <textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="A short bio…"
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </Field>
          <div className="flex justify-end">
            <Button variant="gradient" onClick={handleSave}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
