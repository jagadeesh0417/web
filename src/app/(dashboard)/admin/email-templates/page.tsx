"use client";

import { useEffect, useState } from "react";
import { Mail, Plus, Pencil, Eye, Variable, ChevronDown } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  active: boolean;
}

const AVAILABLE_VARIABLES = [
  "{{studentName}}",
  "{{internshipName}}",
  "{{planName}}",
  "{{duration}}",
  "{{enrollmentId}}",
  "{{loginUrl}}",
  "{{certificateId}}",
];

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "tpl_enrollment",
    name: "Enrollment Confirmation",
    subject: "Welcome to {{internshipName}} — Enrollment Confirmed",
    body: `Dear {{studentName}},

Congratulations! Your enrollment for the {{internshipName}} ({{planName}} — {{duration}}) has been confirmed.

Enrollment ID: {{enrollmentId}}

You can access your dashboard here: {{loginUrl}}

We're excited to have you on board. If you have any questions, don't hesitate to reach out.

Best regards,
The Akradhii Team`,
    variables: ["{{studentName}}", "{{internshipName}}", "{{planName}}", "{{duration}}", "{{enrollmentId}}", "{{loginUrl}}"],
    active: true,
  },
  {
    id: "tpl_welcome",
    name: "Welcome / Access Email",
    subject: "Your {{internshipName}} access is ready",
    body: `Hi {{studentName}},

Your access to the {{internshipName}} learning portal is now active.

Login here: {{loginUrl}}

Start exploring your modules and complete the assignments on time. Good luck!

— The Akradhii Team`,
    variables: ["{{studentName}}", "{{internshipName}}", "{{loginUrl}}"],
    active: true,
  },
  {
    id: "tpl_payment",
    name: "Payment Confirmation",
    subject: "Payment received — {{internshipName}}",
    body: `Dear {{studentName}},

We have received your payment for {{internshipName}} ({{planName}}).

Amount has been processed successfully. Your enrollment is confirmed.

If you need an invoice, please contact support.

Thank you for choosing Akradhii.

— The Akradhii Team`,
    variables: ["{{studentName}}", "{{internshipName}}", "{{planName}}"],
    active: true,
  },
  {
    id: "tpl_feedback",
    name: "Assignment Feedback",
    subject: "Feedback on your assignment — {{internshipName}}",
    body: `Hi {{studentName}},

Your assignment for {{internshipName}} has been reviewed.

Please log in to view detailed feedback and your score:
{{loginUrl}}

Keep up the great work!

— The Akradhii Team`,
    variables: ["{{studentName}}", "{{internshipName}}", "{{loginUrl}}"],
    active: true,
  },
  {
    id: "tpl_certificate",
    name: "Certificate Issued",
    subject: "Your certificate is ready — {{internshipName}}",
    body: `Dear {{studentName}},

Congratulations on completing {{internshipName}}!

Your completion certificate (ID: {{certificateId}}) has been issued.

You can download it from your dashboard: {{loginUrl}}

We wish you all the best in your career ahead.

— The Akradhii Team`,
    variables: ["{{studentName}}", "{{internshipName}}", "{{certificateId}}", "{{loginUrl}}"],
    active: true,
  },
  {
    id: "tpl_password_reset",
    name: "Password Reset",
    subject: "Reset your password",
    body: `Hi {{studentName}},

We received a request to reset your password.

Click the link below to set a new password:
{{loginUrl}}

If you did not request this, please ignore this email.

— The Akradhii Team`,
    variables: ["{{studentName}}", "{{loginUrl}}"],
    active: true,
  },
];

const SAMPLE_DATA: Record<string, string> = {
  "{{studentName}}": "Priya Sharma",
  "{{internshipName}}": "Full Stack Web Development",
  "{{planName}}": "Professional",
  "{{duration}}": "6 weeks",
  "{{enrollmentId}}": "ENR-2024-00123",
  "{{loginUrl}}": "https://app.akradhii.com/student/dashboard",
  "{{certificateId}}": "CERT-2024-FTWD-00123",
};

function renderPreview(template: string): string {
  let result = template;
  for (const [key, value] of Object.entries(SAMPLE_DATA)) {
    result = result.replaceAll(key, value);
  }
  return result;
}

export default function AdminEmailTemplatesPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [showVars, setShowVars] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", body: "", active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
    fetch("/api/admin/email-templates")
      .then((r) => r.json())
      .then((data: EmailTemplate[]) => {
        if (data.length > 0) setTemplates(data);
      })
      .catch(() => {});
  }, []);

  if (!ready || !user)
    return (
      <DashboardShell>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" />
      </DashboardShell>
    );

  const startCreate = () => {
    setForm({ name: "", subject: "", body: "", active: true });
    setEditing(null);
    setShowCreate(true);
  };

  const startEdit = (tpl: EmailTemplate) => {
    setForm({ name: tpl.name, subject: tpl.subject, body: tpl.body, active: tpl.active });
    setEditing(tpl);
    setShowCreate(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.subject.trim()) {
      toast("error", "Required fields", "Template name and subject are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editing?.id }),
      });
      if (!res.ok) throw new Error("Failed");

      if (editing) {
        setTemplates((prev) =>
          prev.map((t) =>
            t.id === editing.id ? { ...t, ...form } : t,
          ),
        );
      } else {
        const newTpl: EmailTemplate = {
          id: `tpl_${Date.now()}`,
          ...form,
          variables: AVAILABLE_VARIABLES.filter((v) => form.body.includes(v)),
        };
        setTemplates((prev) => [...prev, newTpl]);
      }

      setShowCreate(false);
      setEditing(null);
      toast("success", editing ? "Template updated" : "Template created", `${form.name} has been saved.`);
    } catch {
      toast("error", "Save failed", "Could not save email template.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)),
    );
    toast("info", "Status updated", "Template status changed.");
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast("info", "Template deleted", "The template has been removed.");
  };

  return (
    <DashboardShell>
      <PageHeader
        title="Email Templates"
        description="Manage automated email templates for student workflows."
        actions={
          <Button variant="gradient" size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" /> New template
          </Button>
        }
      />

      {showCreate && (
        <Card className="mb-6 border-brand-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand-500" />
              {editing ? "Edit Template" : "New Template"}
            </CardTitle>
            <CardDescription>
              Use variables like {"{{studentName}}"} for dynamic content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Template Name" htmlFor="tpl-name">
                <Input
                  id="tpl-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Enrollment Confirmation"
                />
              </Field>
              <Field label="Subject" htmlFor="tpl-subject">
                <Input
                  id="tpl-subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Welcome to {{internshipName}}"
                />
              </Field>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Body</label>
                <button
                  type="button"
                  onClick={() => setShowVars(!showVars)}
                  className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600"
                >
                   <Variable className="h-3.5 w-3.5" />
                  Available variables
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showVars ? "rotate-180" : ""}`} />
                </button>
              </div>
              {showVars && (
                <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-muted/30 p-2.5">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <span key={v} className="inline-flex items-center rounded-md bg-brand-600/10 px-2 py-0.5 font-mono text-xs text-brand-600 dark:text-brand-300">
                      {v}
                    </span>
                  ))}
                </div>
              )}
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Dear {{studentName}},&#10;&#10;Your enrollment for {{internshipName}} is confirmed."
                className="min-h-[200px] font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="accent-violet-600"
                />
                Active
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setShowCreate(false); setEditing(null); }}>
                Cancel
              </Button>
              <Button variant="gradient" loading={saving} onClick={handleSave}>
                {editing ? "Save Changes" : "Create Template"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {templates.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-10 w-10" />}
          title="No email templates"
          description="Create templates to automate student communication workflows."
          action={
            <Button variant="gradient" size="sm" onClick={startCreate}>
              <Plus className="h-4 w-4" /> Create template
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <Card key={tpl.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">{tpl.name}</CardTitle>
                  <Badge variant={tpl.active ? "success" : "default"}>
                    {tpl.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-xs">
                  {tpl.subject}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                {tpl.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tpl.variables.slice(0, 4).map((v) => (
                      <span key={v} className="inline-flex rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {v}
                      </span>
                    ))}
                    {tpl.variables.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">+{tpl.variables.length - 4}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(tpl)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowPreview(tpl.id)}>
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(tpl.id)}>
                    {tpl.active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteTemplate(tpl.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showPreview && (
        <Card className="mt-6 border-brand-500/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand-500" />
                Preview — {templates.find((t) => t.id === showPreview)?.name}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(null)}>
                Close
              </Button>
            </div>
            <CardDescription>
              Rendered with sample data. Subject: {templates.find((t) => t.id === showPreview)?.subject}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-muted/20 p-5">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                {renderPreview(templates.find((t) => t.id === showPreview)?.body ?? "")}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
