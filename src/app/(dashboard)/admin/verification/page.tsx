"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Link2, RefreshCw, Search, Copy } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getSession, demoGetAllPendingAccounts, demoResendVerification } from "@/lib/auth";
import { getVerifyLog } from "@/lib/data/repository";
import { formatDateTime } from "@/lib/utils";
import type { PendingAccount } from "@/lib/auth";

export default function AdminVerificationPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const pending = demoGetAllPendingAccounts() as PendingAccount[];
  const lookups = getVerifyLog();
  const base = typeof window !== "undefined" ? window.location.origin : "";

  const resend = (email: string) => {
    const token = demoResendVerification(email);
    setSent((s) => ({ ...s, [email]: true }));
    if (!token) toast("error", "No pending account", "This student has no pending verification link.");
    else toast("success", "Link regenerated", "New create-password link generated for this student.");
    setTimeout(() => setSent((s) => ({ ...s, [email]: false })), 4000);
  };

  const copy = (token: string) => {
    void navigator.clipboard?.writeText(`${base}/create-password?token=${token}`);
    toast("success", "Link copied", "Paste it in your email to the student.");
  };

  return (
    <DashboardShell requiredRoles={["admin", "super_admin"]}>
      <PageHeader
        title="Verification"
        description="Pending verification links and certificate lookups."
        actions={<Badge variant="outline">{pending.length} pending · {lookups.length} lookups</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Link2 className="h-4 w-4 text-brand-500" /> Pending verification links</CardTitle>
          <CardDescription>Students who paid but haven&apos;t created their password yet. The link expires in 24 hours.</CardDescription>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <EmptyState icon={<ShieldCheck className="h-10 w-10" />} title="No pending links" description="Every student has activated their account." />
          ) : (
            <div className="space-y-3">
              {pending.map((p) => (
                <div key={p.email} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4">
                  <div>
                    <p className="text-sm font-semibold">{p.name} <span className="ml-1 font-mono text-xs font-normal text-muted-foreground">({p.studentId})</span></p>
                    <p className="font-mono text-xs text-muted-foreground">{p.email}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Created {formatDateTime(p.createdAt)} · token <span className="font-mono">{p.token}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copy(p.token)}><Copy className="h-3.5 w-3.5" /> Copy link</Button>
                    <Button variant="gradient" size="sm" onClick={() => resend(p.email)} loading={Boolean(sent[p.email])}>
                      <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="h-4 w-4 text-brand-500" /> Certificate verification lookups</CardTitle>
          <CardDescription>Everyone who checked a certificate on /verify.</CardDescription>
        </CardHeader>
        <CardContent>
          {lookups.length === 0 ? (
            <EmptyState icon={<Search className="h-10 w-10" />} title="No lookups yet" description="Employer/student verification attempts will appear here." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Certificate ID</th>
                    <th className="px-4 py-3 font-semibold">Result</th>
                    <th className="px-4 py-3 text-right font-semibold">Checked at</th>
                  </tr>
                </thead>
                <tbody>
                  {lookups.map((l, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs">{l.certificateId}</td>
                      <td className="px-4 py-3">
                        <Badge variant={l.found ? "success" : "destructive"}>{l.found ? "Valid certificate" : "Not found"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatDateTime(l.at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
