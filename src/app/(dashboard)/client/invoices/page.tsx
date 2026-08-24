"use client";

import { useEffect, useState } from "react";
import { Receipt, Download } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import { getInvoicesForClient } from "@/lib/data/repository";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

export default function ClientInvoicesPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const invoices = getInvoicesForClient(user.id);

  return (
    <DashboardShell>
      <PageHeader title="Invoices" description="Billing history and downloadable invoices." />

      {invoices.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="No invoices yet"
          description="Invoices are generated per milestone and appear here with downloadable PDFs."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs font-medium">{inv.number}</TableCell>
                    <TableCell>{formatDate(inv.issuedAt)}</TableCell>
                    <TableCell>{formatDate(inv.dueAt)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(inv.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === "paid" ? "success" : inv.status === "overdue" ? "destructive" : "warning"}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => toast("success", "Invoice downloaded", `${inv.number}.pdf`)} aria-label="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
