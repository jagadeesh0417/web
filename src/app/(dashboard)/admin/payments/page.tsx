"use client";

import { useEffect, useState } from "react";
import { CreditCard, IndianRupee, Activity } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth";
import { getPayments } from "@/lib/data/repository";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@/lib/types";

export default function AdminPaymentsPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const payments = getPayments();
  const succeeded = payments.filter((p) => p.status === "succeeded");
  const total = succeeded.reduce((a, p) => a + p.amount, 0);

  const columns: Column<Payment>[] = [
    {
      key: "orderId",
      header: "Order",
      cell: (r) => <span className="font-mono text-xs">{r.orderId}</span>,
    },
    {
      key: "clientName",
      header: "Customer",
      cell: (r) => (
        <div>
          <p className="font-medium">{r.clientName}</p>
          <p className="text-xs text-muted-foreground">{r.email}</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      cell: (r) => <span className="text-sm">{r.plan}</span>,
    },
    {
      key: "invoiceNumber",
      header: "Invoice / Enrollment",
      cell: (r) =>
        r.invoiceNumber ? (
          <div className="font-mono text-xs text-muted-foreground">
            <p>{r.invoiceNumber}</p>
            {r.enrollmentId && <p>{r.enrollmentId}</p>}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (r) => <span className="font-bold">{formatCurrency(r.amount)}</span>,
    },
    {
      key: "provider",
      header: "Gateway",
      cell: (r) => <Badge variant={r.provider === "razorpay" ? "primary" : "info"}>{r.provider}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <Badge variant={r.status === "succeeded" ? "success" : r.status === "pending" ? "warning" : "destructive"}>{r.status}</Badge>,
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>,
    },
  ];

  return (
    <DashboardShell>
      <PageHeader title="Payments" description="Transactions from Razorpay and Stripe, reconciled automatically." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><IndianRupee className="h-4 w-4 text-brand-500" /> Total collected</p>
          <p className="mt-1 text-2xl font-extrabold">{formatCurrency(total)}</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><CreditCard className="h-4 w-4 text-brand-500" /> Successful payments</p>
          <p className="mt-1 text-2xl font-extrabold text-success">{succeeded.length}</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Activity className="h-4 w-4 text-brand-500" /> Pending / failed</p>
          <p className="mt-1 text-2xl font-extrabold text-warning">{payments.length - succeeded.length}</p>
        </Card>
      </div>

      <DataTable data={payments} columns={columns} searchPlaceholder="Search payments…" searchKeys={["clientName", "email", "plan", "orderId"]} filterRows={(r, fv) => (fv.Status === "all" || !fv.Status || r.status === fv.Status)} filters={[{ label: "Status", options: ["succeeded", "pending", "failed"] }]} pageSize={6} />
    </DashboardShell>
  );
}
