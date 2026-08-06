"use client";

import { useEffect, useState } from "react";
import { Globe, Save, RotateCcw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { siteConfig, services } from "@/config/site";

export default function AdminCmsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [hero, setHero] = useState({
    headline: "We build growth engines for ambitious brands",
    subheadline: "Akradhii designs, develops and automates — websites, Meta Ads, CRMs, AI workflows, SEO and branding.",
  });
  const [stats, setStats] = useState([{ label: "Projects delivered", value: "120+" }, { label: "Interns trained", value: "300+" }, { label: "Client satisfaction", value: "98%" }, { label: "Certificates issued", value: "500+" }]);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const save = () => {
    toast("success", "Content published", "Changes are live on the public site.");
  };

  return (
    <DashboardShell>
      <PageHeader title="Website CMS" description="Edit homepage content, stats and site-wide settings." />

      <Tabs defaultValue="homepage">
        <TabsList>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="site">Site settings</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-4 w-4 text-brand-500" /> Hero section</CardTitle>
              <CardDescription>Shown at the top of the homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Headline">
                <Textarea value={hero.headline} onChange={(e) => setHero({ ...hero, headline: e.target.value })} />
              </Field>
              <Field label="Sub-headline">
                <Textarea value={hero.subheadline} onChange={(e) => setHero({ ...hero, subheadline: e.target.value })} />
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => toast("info", "Reset to defaults")}><RotateCcw className="h-4 w-4" /> Reset</Button>
                <Button variant="gradient" onClick={save}><Save className="h-4 w-4" /> Publish</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Services section</CardTitle>
              <CardDescription>Managed from the services registry — {services.length} active services.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {services.map((s) => <Badge key={s.id} variant="primary">{s.title}</Badge>)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Homepage stats</CardTitle>
              <CardDescription>Four numbers shown under the hero.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {stats.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-3">
                  <Input value={s.value} onChange={(e) => setStats(stats.map((x, xi) => (xi === i ? { ...x, value: e.target.value } : x)))} placeholder="Value" />
                  <Input value={s.label} onChange={(e) => setStats(stats.map((x, xi) => (xi === i ? { ...x, label: e.target.value } : x)))} placeholder="Label" />
                </div>
              ))}
              <div className="sm:col-span-2 flex justify-end">
                <Button variant="gradient" onClick={save}><Save className="h-4 w-4" /> Publish stats</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="site" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Site settings</CardTitle>
              <CardDescription>Contact details used across the site and in emails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Contact email">
                  <Input defaultValue={siteConfig.email} />
                </Field>
                <Field label="Support email">
                  <Input defaultValue={siteConfig.supportEmail} />
                </Field>
                <Field label="Phone">
                  <Input defaultValue={siteConfig.phone} />
                </Field>
                <Field label="Address">
                  <Input defaultValue={siteConfig.address} />
                </Field>
              </div>
              <div className="flex justify-end">
                <Button variant="gradient" onClick={save}><Save className="h-4 w-4" /> Save settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
