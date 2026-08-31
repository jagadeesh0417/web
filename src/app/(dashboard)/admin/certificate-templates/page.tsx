"use client";

import { useState } from "react";
import { Plus, Eye, Pencil, ToggleLeft, ToggleRight, Palette, Tag, FileText } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/utils";
import { generateId } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

interface TemplateConfig {
  backgroundColor: string;
  borderColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  organizationName: string;
  signatureTitle: string;
}

interface CertificateTemplate {
  id: string;
  name: string;
  categorySlug: string;
  status: "active" | "inactive";
  createdAt: string;
  config: TemplateConfig;
}

const defaultConfig: TemplateConfig = {
  backgroundColor: "#ffffff",
  borderColor: "#7c3aed",
  titleColor: "#1a1a1a",
  textColor: "#4b5563",
  accentColor: "#7c3aed",
  organizationName: siteConfig.name,
  signatureTitle: "Founder & CEO",
};

const initialTemplates: CertificateTemplate[] = [
  {
    id: "tpl_web",
    name: "Web Development Certificate",
    categorySlug: "web-development",
    status: "active",
    createdAt: "2024-01-15T00:00:00Z",
    config: { ...defaultConfig },
  },
  {
    id: "tpl_design",
    name: "Design Certificate",
    categorySlug: "ui-ux-design",
    status: "active",
    createdAt: "2024-01-15T00:00:00Z",
    config: { ...defaultConfig, borderColor: "#2563eb", accentColor: "#2563eb" },
  },
  {
    id: "tpl_marketing",
    name: "Marketing Certificate",
    categorySlug: "meta-ads, digital-marketing, seo",
    status: "active",
    createdAt: "2024-02-01T00:00:00Z",
    config: { ...defaultConfig, borderColor: "#059669", accentColor: "#059669" },
  },
  {
    id: "tpl_general",
    name: "General Certificate",
    categorySlug: "*",
    status: "active",
    createdAt: "2024-02-01T00:00:00Z",
    config: { ...defaultConfig },
  },
];

const templateVariables = [
  { variable: "{{studentName}}", description: "Student's full name" },
  { variable: "{{certificateId}}", description: "Unique certificate ID" },
  { variable: "{{internshipName}}", description: "Category/program name" },
  { variable: "{{duration}}", description: "Duration in weeks" },
  { variable: "{{startDate}}", description: "Internship start date" },
  { variable: "{{completionDate}}", description: "Completion date" },
  { variable: "{{issueDate}}", description: "Certificate issue date" },
  { variable: "{{organizationName}}", description: "Organization name (Akradhii)" },
  { variable: "{{score}}", description: "Assessment score" },
];

type Tab = "templates" | "preview" | "variables";

export default function AdminCertificateTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<CertificateTemplate[]>(initialTemplates);
  const [tab, setTab] = useState<Tab>("templates");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewConfig, setPreviewConfig] = useState<TemplateConfig>(defaultConfig);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", categorySlug: "" });

  const editingTemplate = editingId ? templates.find((t) => t.id === editingId) ?? null : null;

  const handleCreate = () => {
    if (!newTemplate.name.trim()) {
      toast("error", "Template name required");
      return;
    }
    const tpl: CertificateTemplate = {
      id: `tpl_${generateId("template")}`,
      name: newTemplate.name.trim(),
      categorySlug: newTemplate.categorySlug.trim() || "*",
      status: "active",
      createdAt: new Date().toISOString(),
      config: { ...defaultConfig },
    };
    setTemplates((prev) => [...prev, tpl]);
    setNewTemplate({ name: "", categorySlug: "" });
    setShowCreateForm(false);
    toast("success", "Template created", `${tpl.name} is now available.`);
  };

  const handleToggleStatus = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t))
    );
    const tpl = templates.find((t) => t.id === id);
    if (tpl) toast("success", `${tpl.name} ${tpl.status === "active" ? "deactivated" : "activated"}`);
  };

  const handleUpdateConfig = (id: string, config: TemplateConfig) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, config } : t)));
    setEditingId(null);
    toast("success", "Template updated");
  };

  const openPreview = (config: TemplateConfig) => {
    setPreviewConfig(config);
    setTab("preview");
  };

  const tabButton = (key: Tab, label: string) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        tab === key
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <DashboardShell>
      <PageHeader
        title="Certificate Templates"
        description="Manage certificate templates, customize colors, and preview how certificates look for each internship category."
        actions={
          <Button variant="gradient" size="sm" onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" /> New template
          </Button>
        }
      />

      <div className="mb-6 flex gap-2">
        {tabButton("templates", "Templates")}
        {tabButton("preview", "Preview")}
        {tabButton("variables", "Variables")}
      </div>

      {showCreateForm && (
        <Card className="mb-6 border-brand-500/40">
          <CardHeader>
            <CardTitle>Create new template</CardTitle>
            <CardDescription>Define a template name and applicable category slug.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Template name">
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g. Web Development Certificate"
                />
              </Field>
              <Field label="Category slug" hint="Use * for all categories, or comma-separated slugs">
                <Input
                  value={newTemplate.categorySlug}
                  onChange={(e) => setNewTemplate({ ...newTemplate, categorySlug: e.target.value })}
                  placeholder="e.g. web-development"
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleCreate}>
                Create template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {editingTemplate && (
        <TemplateConfigEditor
          template={editingTemplate}
          onSave={(config) => handleUpdateConfig(editingTemplate.id, config)}
          onCancel={() => setEditingId(null)}
          onPreview={openPreview}
        />
      )}

      {tab === "templates" && (
        <div className="space-y-4">
          {templates.map((tpl) => (
            <Card key={tpl.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border"
                    style={{ borderColor: tpl.config.borderColor, backgroundColor: tpl.config.backgroundColor + "20" }}
                  >
                    <FileText className="h-5 w-5" style={{ color: tpl.config.accentColor }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{tpl.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Category: <span className="font-medium text-foreground">{tpl.categorySlug}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Created {formatDate(tpl.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={tpl.status === "active" ? "success" : "default"}>{tpl.status}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => openPreview(tpl.config)} title="Preview">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingId(tpl.id)} title="Edit config">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(tpl.id)} title="Toggle status">
                    {tpl.status === "active" ? (
                      <ToggleRight className="h-5 w-5 text-success" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "preview" && (
        <PreviewSection config={previewConfig} />
      )}

      {tab === "variables" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-brand-500" /> Available Template Variables
            </CardTitle>
            <CardDescription>Use these placeholders in your certificate templates. They will be replaced with actual values when a certificate is generated.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Variable</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {templateVariables.map((v) => (
                    <tr key={v.variable} className="transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <code className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-medium">{v.variable}</code>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{v.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}

function TemplateConfigEditor({
  template,
  onSave,
  onCancel,
  onPreview,
}: {
  template: CertificateTemplate;
  onSave: (config: TemplateConfig) => void;
  onCancel: () => void;
  onPreview: (config: TemplateConfig) => void;
}) {
  const [config, setConfig] = useState<TemplateConfig>({ ...template.config });

  const update = (key: keyof TemplateConfig, value: string) => setConfig((c) => ({ ...c, [key]: value }));

  return (
    <Card className="mb-6 border-brand-500/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-brand-500" /> Configure: {template.name}
        </CardTitle>
        <CardDescription>Customize the visual appearance of this certificate template.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Organization name">
            <Input value={config.organizationName} onChange={(e) => update("organizationName", e.target.value)} />
          </Field>
          <Field label="Signature title">
            <Input value={config.signatureTitle} onChange={(e) => update("signatureTitle", e.target.value)} />
          </Field>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Colors</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Background color">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => update("backgroundColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                />
                <Input value={config.backgroundColor} onChange={(e) => update("backgroundColor", e.target.value)} />
              </div>
            </Field>
            <Field label="Border color">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.borderColor}
                  onChange={(e) => update("borderColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                />
                <Input value={config.borderColor} onChange={(e) => update("borderColor", e.target.value)} />
              </div>
            </Field>
            <Field label="Title color">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.titleColor}
                  onChange={(e) => update("titleColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                />
                <Input value={config.titleColor} onChange={(e) => update("titleColor", e.target.value)} />
              </div>
            </Field>
            <Field label="Text color">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.textColor}
                  onChange={(e) => update("textColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                />
                <Input value={config.textColor} onChange={(e) => update("textColor", e.target.value)} />
              </div>
            </Field>
            <Field label="Accent color">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => update("accentColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-border"
                />
                <Input value={config.accentColor} onChange={(e) => update("accentColor", e.target.value)} />
              </div>
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant="outline" onClick={() => onPreview(config)}>Preview</Button>
          <Button variant="gradient" onClick={() => onSave(config)}>Save changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PreviewSection({ config }: { config: TemplateConfig }) {
  const sampleDate = "2024-06-15";
  const verifyUrl = `${siteConfig.url}/verify-certificate?certificateId=AKR-2024-PREVIEW01`;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This is a live preview using your current template configuration. Changes will reflect here in real-time.
      </p>
      <div
        className="certificate-sheet relative overflow-hidden rounded-2xl border-2 bg-card"
        style={{ borderColor: config.borderColor + "80" }}
      >
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: config.accentColor + "15" }}
        />
        <div
          className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl"
          style={{ backgroundColor: config.accentColor + "10" }}
        />

        <div className="relative p-8 sm:p-12">
          <div className="flex items-start justify-between">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.25em]"
                style={{ color: config.accentColor }}
              >
                {config.organizationName}
              </p>
              <h1
                className="mt-2 text-3xl font-black tracking-tight sm:text-4xl"
                style={{ color: config.titleColor }}
              >
                Certificate of Completion
              </h1>
            </div>
            <div
              className="hidden h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white sm:flex"
              style={{ background: `linear-gradient(135deg, ${config.accentColor}, ${config.borderColor})` }}
            >
              A
            </div>
          </div>

          <p className="mt-2 text-xs" style={{ color: config.textColor }}>
            This certificate is proudly presented to
          </p>
          <p className="mt-3 text-3xl font-extrabold sm:text-4xl" style={{ color: config.titleColor }}>
            Priya Sharma
          </p>

          <div
            className="mx-auto my-8 h-px w-2/3"
            style={{ background: `linear-gradient(to right, transparent, ${config.accentColor}99, transparent)` }}
          />

          <p className="text-sm leading-relaxed" style={{ color: config.textColor }}>
            for successfully completing the{" "}
            <span className="font-semibold" style={{ color: config.titleColor }}>Professional Internship</span> in{" "}
            <span className="font-semibold" style={{ color: config.titleColor }}>Web Development</span>, a{" "}
            6-week structured internship at {config.organizationName}, with a performance score of{" "}
            <span className="font-semibold" style={{ color: config.titleColor }}>92%</span>.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: config.textColor }}>
                Duration
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: config.titleColor }}>
                6 weeks
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: config.textColor }}>
                Completed
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: config.titleColor }}>
                {formatDate(sampleDate)}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: config.textColor }}>
                Certificate ID
              </p>
              <p className="mt-1 text-sm font-mono font-semibold" style={{ color: config.titleColor }}>
                AKR-2024-PREVIEW01
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-end justify-between">
            <div>
              <p className="font-serif text-xl italic" style={{ color: config.titleColor }}>
                {config.organizationName}
              </p>
              <div className="mt-1 h-px w-40" style={{ backgroundColor: config.textColor + "66" }} />
              <p className="mt-1 text-[10px] uppercase tracking-widest" style={{ color: config.textColor }}>
                {config.signatureTitle}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="rounded-xl border border-border bg-white p-2">
                <QRCodeSVG value={verifyUrl} size={88} level="M" />
              </div>
              <p className="text-[9px]" style={{ color: config.textColor }}>
                Scan to verify
              </p>
            </div>
          </div>

          <p
            className="mt-6 border-t pt-4 text-center text-[10px]"
            style={{ borderColor: config.textColor + "33", color: config.textColor }}
          >
            Verify authenticity at {verifyUrl} · Issued by {siteConfig.name} on {formatDate(sampleDate)}
          </p>
        </div>
      </div>
    </div>
  );
}
