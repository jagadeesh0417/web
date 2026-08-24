"use client";

import { useEffect, useState } from "react";
import { Mail, MailOpen } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import { getEmailLog } from "@/lib/data/repository";
import { formatDateTime } from "@/lib/utils";

export default function AdminEmailLogPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const log = getEmailLog();

  return (
    <DashboardShell requiredRoles={["admin", "super_admin"]}>
      <PageHeader
        title="Email Log"
        description="Every workflow email sent to students, mentors and clients."
        actions={<Badge variant="outline">{log.length} emails</Badge>}
      />

      {log.length === 0 ? (
        <EmptyState icon={<Mail className="h-10 w-10" />} title="No emails yet" description="Workflow emails (payment, offer letter, welcome, feedback) will appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">To</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Template</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Sent at</th>
              </tr>
            </thead>
            <tbody>
              {log.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs">{e.to}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-medium">
                      <MailOpen className="h-3.5 w-3.5 text-brand-500" /> {e.subject}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground sm:table-cell">{e.template}</td>
                  <td className="px-4 py-3">
                    <Badge variant={e.status === "sent" ? "success" : "destructive"}>{e.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatDateTime(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
