"use client";

import { FileBarChart, Download } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function AdminReportsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const reports = [
    { title: "Monthly growth report", desc: "Users, visitors, applications and conversion — PDF + CSV.", period: "Last month", fresh: true },
    { title: "Internship cohort report", desc: "Per-cohort completion, scores and certificate issuance.", period: "Quarterly", fresh: true },
    { title: "Revenue & invoicing", desc: "Collected, outstanding and gateway-wise split.", period: "Last month", fresh: false },
    { title: "Client health report", desc: "NPS, ticket volume and project velocity per account.", period: "Quarterly", fresh: true },
  ];

  return (
    <DashboardShell>
      <PageHeader title="Reports" description="Exportable reports for leadership and client reviews." />
      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileBarChart className="h-4 w-4 text-brand-500" /> {r.title}</CardTitle>
                {r.fresh && <Badge variant="success">Fresh</Badge>}
              </div>
              <CardDescription>{r.desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{r.period}</span>
              <Button variant="outline" size="sm" onClick={() => toast("success", "Report generated", `${r.title} — queued for download.`)}>
                <Download className="h-4 w-4" /> Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
