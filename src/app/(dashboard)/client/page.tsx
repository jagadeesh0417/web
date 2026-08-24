"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Receipt, LifeBuoy, ArrowUpRight, CheckCircle2, Clock3 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/auth";
import { getProjectsForClient, getInvoicesForClient, getTicketsForClient } from "@/lib/data/repository";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

export default function ClientDashboard() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const projects = getProjectsForClient(user.id);
  const invoices = getInvoicesForClient(user.id);
  const tickets = getTicketsForClient(user.id);
  const activeProjects = projects.filter((p) => p.status !== "completed").length;
  const outstanding = invoices.filter((i) => i.status === "pending" || i.status === "overdue").reduce((a, i) => a + i.amount, 0);

  return (
    <DashboardShell>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Your projects, invoices and support — all in one place."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active projects" value={String(activeProjects)} delta={1} deltaLabel="this month" icon={FolderKanban} gradient="from-violet-600 to-indigo-600" />
        <StatCard title="Outstanding" value={formatCurrency(outstanding)} delta={12} deltaLabel="vs last month" icon={Receipt} gradient="from-amber-500 to-orange-600" />
        <StatCard title="Open tickets" value={String(tickets.filter((t) => t.status !== "resolved").length)} delta={-2} deltaLabel="vs last week" icon={LifeBuoy} gradient="from-blue-600 to-cyan-500" />
        <StatCard title="Total invested" value={formatCurrency(invoices.reduce((a, i) => a + i.amount, 0))} delta={0} deltaLabel="all time" icon={ArrowUpRight} gradient="from-emerald-600 to-teal-500" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Live status of your engagements</CardDescription>
            </div>
            <Link href="/client/projects"><Button variant="ghost" size="sm">View all <ArrowUpRight className="h-4 w-4" /></Button></Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.service} · due {formatDate(p.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.status === "completed" ? "success" : p.status === "review" ? "warning" : "info"}>
                      {p.status.replace("_", " ")}
                    </Badge>
                    <span className="text-sm font-bold">{p.progress}%</span>
                  </div>
                </div>
                <Progress value={p.progress} className="mt-3" />
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {p.milestones.map((m) => (
                    <span key={m.title} className="flex items-center gap-1">
                      {m.done ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Clock3 className="h-3.5 w-3.5" />}
                      {m.title}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Latest invoice</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices[0] ? (
                <>
                  <p className="font-mono text-sm">{invoices[0].number}</p>
                  <p className="mt-1 text-2xl font-extrabold">{formatCurrency(invoices[0].amount)}</p>
                  <Badge variant={invoices[0].status === "paid" ? "success" : "warning"} className="mt-2">{invoices[0].status}</Badge>
                  <Link href="/client/invoices"><Button variant="outline" size="sm" className="mt-4 w-full">View invoices</Button></Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No invoices yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {tickets.filter((t) => t.status !== "resolved").length} open ticket(s). Average first response: 4 hours.
              </p>
              <Link href="/client/support"><Button variant="gradient" size="sm" className="mt-3 w-full">Open a ticket</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
