"use client";

import { useEffect, useState } from "react";
import { Award, Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { getCertificates, issueCertificate } from "@/lib/data/repository";
import { formatDate } from "@/lib/utils";
import { certificateId } from "@/lib/utils";
import type { Certificate } from "@/lib/types";

export default function AdminCertificatesPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string; name?: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [form, setForm] = useState({ studentName: "", studentId: "u_student", categoryName: "Web Development", programTitle: "Professional Internship", durationWeeks: "6", score: "90" });

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const certificates = getCertificates();

  const handleIssue = () => {
    if (!form.studentName.trim()) {
      toast("error", "Student name required");
      return;
    }
    const end = new Date().toISOString();
    const start = new Date(Date.now() - Number(form.durationWeeks) * 7 * 86400000).toISOString();
    const cert = issueCertificate({
      certificateId: certificateId(),
      studentId: form.studentId,
      studentName: form.studentName.trim(),
      categoryName: form.categoryName,
      programTitle: form.programTitle,
      durationWeeks: Number(form.durationWeeks) as 4 | 6 | 8,
      startDate: start.slice(0, 10),
      endDate: end.slice(0, 10),
      score: Math.min(100, Math.max(0, Number(form.score) || 90)),
      issuedBy: user.name ?? "Akradhii",
    });
    setIssuing(false);
    setForm((f) => ({ ...f, studentName: "" }));
    toast("success", "Certificate issued", `${cert.certificateId} — student notified by email.`);
  };

  const columns: Column<Certificate>[] = [
    {
      key: "certificateId",
      header: "Certificate ID",
      cell: (r) => <span className="font-mono text-xs font-medium">{r.certificateId}</span>,
    },
    {
      key: "studentName",
      header: "Student",
      cell: (r) => <span className="font-medium">{r.studentName}</span>,
    },
    {
      key: "programTitle",
      header: "Program",
      cell: (r) => <Badge variant="primary">{r.categoryName} · {r.durationWeeks}w</Badge>,
    },
    {
      key: "score",
      header: "Score",
      cell: (r) => <span className="text-sm">{r.score}%</span>,
    },
    {
      key: "issuedAt",
      header: "Issued",
      cell: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.issuedAt)}</span>,
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Certificates"
        description="Issue and manage completion certificates. Each has a unique ID, QR code and public verification."
        actions={<Button variant="gradient" size="sm" onClick={() => setIssuing(!issuing)}><Plus className="h-4 w-4" /> Issue certificate</Button>}
      />

      {issuing && (
        <Card className="mb-6 border-brand-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="h-4 w-4 text-brand-500" /> Issue new certificate</CardTitle>
            <CardDescription>Only issue after attendance threshold, required assignments and final project are verified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Student name">
                <Input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="Full name as on ID" />
              </Field>
              <Field label="Category">
                <Input value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} />
              </Field>
              <Field label="Program">
                <Input value={form.programTitle} onChange={(e) => setForm({ ...form, programTitle: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Duration">
                  <select value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30">
                    <option value="4">4 weeks</option>
                    <option value="6">6 weeks</option>
                    <option value="8">8 weeks</option>
                  </select>
                </Field>
                <Field label="Score %">
                  <Input type="number" min={0} max={100} value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIssuing(false)}>Cancel</Button>
              <Button variant="gradient" onClick={handleIssue}>Issue certificate</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DataTable
        data={certificates}
        columns={columns}
        searchPlaceholder="Search by ID or student…"
        searchKeys={["certificateId", "studentName"]}
        pageSize={6}
      />
    </DashboardShell>
  );
}
