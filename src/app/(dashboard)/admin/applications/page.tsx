"use client";

import { useEffect, useState } from "react";
import { FileStack, CheckCircle2, XCircle, FileQuestion, Mail } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useDialog } from "@/components/ui/dialog";
import { getSession } from "@/lib/auth";
import { getApplications, updateApplicationStatus } from "@/lib/data/repository";
import { pushNotification } from "@/lib/notifications";
import { formatDate, timeAgo } from "@/lib/utils";
import { CATEGORY_BY_SLUG, PROGRAM_BY_SLUG } from "@/lib/constants";
import type { Application, ApplicationStatus } from "@/lib/types";

const statusVariant: Record<ApplicationStatus, "warning" | "info" | "success" | "destructive" | "default"> = {
  pending: "warning",
  under_review: "info",
  approved: "success",
  rejected: "destructive",
  requested_info: "default",
};

export default function AdminApplicationsPage() {
  const { toast } = useToast();
  const { confirm } = useDialog();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Application | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const applications = getApplications();
  const counts = {
    pending: applications.filter((a) => a.status === "pending").length,
    under_review: applications.filter((a) => a.status === "under_review").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const setStatus = async (app: Application, status: ApplicationStatus) => {
    if (status === "approved") {
      const ok = await confirm({
        title: "Approve application",
        description: `${app.profile.fullName} will gain full dashboard access as an intern and be notified by email.`,
        confirmLabel: "Approve",
      });
      if (!ok) return;
    }
    if (status === "rejected") {
      const ok = await confirm({
        title: "Reject application",
        description: "This cannot be undone easily. Consider requesting more info instead.",
        confirmLabel: "Reject",
        destructive: true,
      });
      if (!ok) return;
    }
    updateApplicationStatus(app.id, status, note.trim() || undefined);
    pushNotification(app.userId, "Application status update", `Your application is now: ${status.replace("_", " ")}`, "approval");
    toast("success", "Application updated", `${app.profile.fullName} → ${status.replace("_", " ")}. Email notification queued.`);
    setNote("");
  };

  const columns: Column<Application>[] = [
    {
      key: "applicant",
      header: "Applicant",
      cell: (r) => (
        <div>
          <p className="font-medium">{r.profile.fullName}</p>
          <p className="text-xs text-muted-foreground">{r.profile.email}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category / Program",
      cell: (r) => (
        <div>
          <Badge variant="primary">{CATEGORY_BY_SLUG[r.categorySlug]?.name ?? r.categorySlug}</Badge>
          <p className="mt-1 text-xs text-muted-foreground">{PROGRAM_BY_SLUG[r.programSlug]?.title ?? r.programSlug}</p>
        </div>
      ),
    },
    {
      key: "college",
      header: "College",
      cell: (r) => (
        <div>
          <p className="text-sm">{r.profile.college}</p>
          <p className="text-xs text-muted-foreground">{r.profile.course} · {r.profile.yearOfStudy}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Applied",
      cell: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <Badge variant={statusVariant[r.status]}>{r.status.replace("_", " ")}</Badge>,
    },
    {
      key: "actions",
      header: "",
      cell: (r) => <Button variant="outline" size="sm" onClick={() => setSelected(r)}>Review</Button>,
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Applications"
        description="Review internship applications — approve, reject or request more information."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(counts).map(([key, value]) => (
          <Card key={key} className="p-4 text-center">
            <p className="text-2xl font-extrabold text-gradient">{value}</p>
            <p className="text-xs capitalize text-muted-foreground">{key.replace("_", " ")}</p>
          </Card>
        ))}
      </div>

      <DataTable
        data={applications}
        columns={columns}
        searchPlaceholder="Search applicants…"
        searchKeys={["profile", "email", "college"]}
        pageSize={6}
        filterRows={(r, fv) => (fv.Status === "all" || !fv.Status || r.status === fv.Status)}
        filters={[{ label: "Status", options: ["pending", "under_review", "approved", "rejected", "requested_info"] }]}
      />

      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <Card className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto scrollbar-thin">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileStack className="h-4 w-4 text-brand-500" /> Application review</CardTitle>
                <Badge variant={statusVariant[selected.status]}>{selected.status.replace("_", " ")}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 rounded-xl border border-border p-4 text-sm sm:grid-cols-2">
                {[
                  ["Full name", selected.profile.fullName],
                  ["Mobile", selected.profile.mobile],
                  ["Email", selected.profile.email],
                  ["College", selected.profile.college],
                  ["Course", selected.profile.course],
                  ["Year", selected.profile.yearOfStudy],
                  ["LinkedIn", selected.profile.linkedin ?? "—"],
                  ["GitHub", selected.profile.github ?? "—"],
                  ["Resume", selected.profile.resumeUrl ?? "—"],
                  ["ID proof", selected.profile.idUrl ?? "—"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{k}</p>
                    <p className="mt-0.5 font-medium">{v}</p>
                  </div>
                ))}
              </div>

              {selected.status === "requested_info" && selected.notes && (
                <div className="rounded-xl border border-warning/40 bg-warning/5 p-3 text-sm">
                  <p className="font-medium text-warning">Requested information</p>
                  <p className="mt-1">{selected.notes}</p>
                </div>
              )}

              <Field label="Note (optional — sent to applicant)">
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={`For ${selected.profile.fullName}…`} />
              </Field>

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button variant="success" onClick={() => setStatus(selected, "approved")}>
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button variant="warning" onClick={() => setStatus(selected, "requested_info")}>
                  <FileQuestion className="h-4 w-4" /> Request info
                </Button>
                <Button variant="outline" onClick={() => setStatus(selected, "under_review")}>
                  Mark under review
                </Button>
                <Button variant="danger" onClick={() => setStatus(selected, "rejected")}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
                <Button variant="ghost" className="ml-auto" onClick={() => setSelected(null)}>Close</Button>
              </div>

              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> Applicant receives an email + in-app notification on every status change · applied {timeAgo(selected.createdAt)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
