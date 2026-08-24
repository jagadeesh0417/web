"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Inbox, RefreshCw, MessageCircle } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { fetchLeadsAdmin } from "@/lib/leads/client";
import { formatDateTime } from "@/lib/utils";
import type { WebsiteLead } from "@/lib/leads/types";

function statusVariant(s: WebsiteLead["whatsappStatus"]): "success" | "warning" | "destructive" | "outline" | "info" {
  if (s === "sent") return "success";
  if (s === "pending") return "warning";
  if (s === "failed") return "destructive";
  if (s === "skipped") return "outline";
  return "info";
}

export default function AdminLeadsPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [leads, setLeads] = useState<WebsiteLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchLeadsAdmin();
    setLeads(res.leads);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ready && user) void load();
  }, [ready, user, load]);

  const filtered = useMemo(() => {
    if (filter === "all") return leads;
    return leads.filter((l) => l.formType === filter || l.whatsappStatus === filter);
  }, [leads, filter]);

  if (!ready || !user) {
    return (
      <DashboardShell>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell requiredRoles={["admin", "super_admin"]}>
      <PageHeader
        title="Website Leads"
        description="Every contact, internship and support submission — with WhatsApp delivery status."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline">{leads.length} leads</Badge>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { id: "all", label: "All" },
          { id: "contact", label: "Contact" },
          { id: "internship_application", label: "Internships" },
          { id: "support", label: "Support" },
          { id: "sent", label: "WhatsApp sent" },
          { id: "failed", label: "WhatsApp failed" },
          { id: "skipped", label: "WhatsApp skipped" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === f.id
                ? "border-brand-500 bg-brand-600/10 text-brand-600"
                : "border-border text-muted-foreground hover:border-brand-500/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-10 w-10" />}
          title="No leads yet"
          description="Submissions from Contact, Internship Apply and Support will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Service / Internship</th>
                <th className="px-4 py-3 font-semibold">WhatsApp</th>
                <th className="px-4 py-3 text-right font-semibold">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{lead.name || "—"}</p>
                    <p className="text-[11px] text-muted-foreground">{lead.formType.replace(/_/g, " ")}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs">{lead.email || "—"}</p>
                    <p className="text-xs text-muted-foreground">{lead.phone || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium">{lead.source}</p>
                    <p className="text-[11px] text-muted-foreground">{lead.pagePath || lead.page}</p>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <p className="text-xs">{lead.service || lead.internship || lead.course || "—"}</p>
                    {lead.message && (
                      <p className="mt-0.5 line-clamp-2 max-w-[220px] text-[11px] text-muted-foreground">{lead.message}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(lead.whatsappStatus)} className="gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {lead.whatsappStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                    {formatDateTime(lead.submittedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
