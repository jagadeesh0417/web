"use client";

import { useEffect, useState } from "react";
import { Building2, Save, Loader2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import type { CompanySettings } from "@/lib/types";

const defaults: CompanySettings = {
  id: "company_default",
  companyName: "Akradhii",
  companyTagline: "Digital Growth Studio",
  logoUrl: "",
  websiteUrl: "https://akradhii.vercel.app",
  udyamNumber: "UDYAM-TS-19-0012345",
  msmeInfo: "MSME Registered Enterprise",
  address: "HITEC City, Hyderabad, Telangana 500081, India",
  authorizedSignatoryName: "Akradhii",
  authorizedSignatoryDesignation: "Director",
  certificatePrefix: "AKR",
  supportEmail: "support@akradhii.com",
  phone: "+91 98485 79053",
  updatedAt: new Date().toISOString(),
};

export default function CompanySettingsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CompanySettings>(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSession().then(async ({ user }) => {
      setUser(user);
      try {
        const res = await fetch("/api/admin/company-settings");
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.settings) setForm(data.settings);
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
        setReady(true);
      }
    });
  }, []);

  if (!ready || !user || loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      </DashboardShell>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/company-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      if (data.ok && data.settings) setForm(data.settings);
      toast("success", "Settings saved", "Company settings updated successfully.");
    } catch {
      toast("error", "Save failed", "Could not save company settings.");
    } finally {
      setSaving(false);
    }
  };

  const update = (patch: Partial<CompanySettings>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <DashboardShell>
      <PageHeader
        title="Company Settings"
        description="Configure company information used on certificates, emails, and verification pages."
        actions={
          <Button variant="gradient" size="sm" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" /> Save settings
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand-500" /> Company Information
            </CardTitle>
            <CardDescription>Basic company details displayed on certificates and public pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company Name">
                <Input value={form.companyName} onChange={(e) => update({ companyName: e.target.value })} />
              </Field>
              <Field label="Tagline">
                <Input value={form.companyTagline} onChange={(e) => update({ companyTagline: e.target.value })} />
              </Field>
            </div>
            <Field label="Website URL">
              <Input value={form.websiteUrl} onChange={(e) => update({ websiteUrl: e.target.value })} />
            </Field>
            <Field label="Logo URL (optional)">
              <Input value={form.logoUrl} onChange={(e) => update({ logoUrl: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Address">
              <Input value={form.address} onChange={(e) => update({ address: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Support Email">
                <Input value={form.supportEmail} onChange={(e) => update({ supportEmail: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand-500" /> Certificate Settings
            </CardTitle>
            <CardDescription>Information displayed on certificates and used for certificate ID generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Udyam Registration Number">
              <Input value={form.udyamNumber} onChange={(e) => update({ udyamNumber: e.target.value })} />
            </Field>
            <Field label="MSME Information">
              <Input value={form.msmeInfo} onChange={(e) => update({ msmeInfo: e.target.value })} />
            </Field>
            <Field label="Certificate ID Prefix">
              <Input value={form.certificatePrefix} onChange={(e) => update({ certificatePrefix: e.target.value })} placeholder="AKR" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Authorized Signatory Name">
                <Input value={form.authorizedSignatoryName} onChange={(e) => update({ authorizedSignatoryName: e.target.value })} />
              </Field>
              <Field label="Designation">
                <Input value={form.authorizedSignatoryDesignation} onChange={(e) => update({ authorizedSignatoryDesignation: e.target.value })} />
              </Field>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
