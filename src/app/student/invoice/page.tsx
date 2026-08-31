"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, IndianRupee } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { EmptyState } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { getStudentProgress, getPaymentForEnrollment } from "@/lib/data/repository";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

export default function InvoicePage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const p = getStudentProgress(user.id);
  const enrollment = p.enrollment;

  if (!enrollment) {
    return (
      <DashboardShell>
        <EmptyState icon={<IndianRupee className="h-10 w-10" />} title="No invoice" description="You need an active enrollment to view your invoice." />
      </DashboardShell>
    );
  }

  const payment = getPaymentForEnrollment(enrollment.paymentId);
  const taxable = Math.round((enrollment.price / 1.18) * 100) / 100;
  const gst = Math.round((enrollment.price - taxable) * 100) / 100;
  const cgst = Math.round((gst / 2) * 100) / 100;
  const sgst = Math.round((gst / 2) * 100) / 100;

  return (
    <DashboardShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/student/downloads">
          <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Downloads</Button>
        </Link>
        <Button variant="gradient" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Save as PDF</Button>
      </div>

      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none sm:p-12">
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">Akradhii Pvt. Ltd.</p>
            <p className="mt-1 text-xs text-muted-foreground">GSTIN: 29ABCDE1234F1Z5 · CIN: U72900KA2024PTC000000</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Bengaluru, Karnataka · hello@akradhii.com</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tax Invoice</p>
            <p className="mt-1 font-mono text-xs text-foreground">{enrollment.invoiceNumber}</p>
            <p className="font-mono text-xs text-muted-foreground">Order {payment?.orderId}</p>
          </div>
        </div>

        <div className="grid gap-6 py-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Billed to</p>
            <p className="mt-1 font-semibold text-foreground">{user.name}</p>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">Student ID: {enrollment.studentId}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Payment details</p>
            <p className="mt-1 text-muted-foreground">Method: {payment?.method ?? "upi"} (Razorpay)</p>
            <p className="text-muted-foreground">Date: {payment ? formatDate(payment.createdAt) : "—"}</p>
            <p className="text-muted-foreground">Status: <span className="font-semibold text-success">Paid</span></p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 font-semibold">Description</th>
              <th className="pb-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-3">
                <p className="font-medium text-foreground">{enrollment.programTitle} — Online Internship Program</p>
                <p className="text-xs text-muted-foreground">{enrollment.durationWeeks} weeks · self-paced · mentorship + assessment + certification</p>
              </td>
              <td className="py-3 text-right font-medium">{formatCurrency(taxable)}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 text-muted-foreground">CGST @ 9%</td>
              <td className="py-2 text-right text-muted-foreground">{formatCurrency(cgst)}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 text-muted-foreground">SGST @ 9%</td>
              <td className="py-2 text-right text-muted-foreground">{formatCurrency(sgst)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-3 text-right font-bold text-foreground">Total paid ({payment?.currency ?? "INR"})</td>
              <td className="pt-3 text-right text-lg font-bold text-foreground">{formatCurrency(enrollment.price)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-8 flex items-start justify-between border-t border-border pt-6">
          <div className="text-[11px] text-muted-foreground">
            <p>This is a computer-generated invoice and does not require a physical signature.</p>
            <p className="mt-1">For payment queries: payments@akradhii.com</p>
          </div>
          <p className="text-[11px] text-muted-foreground">Thank you for choosing Akradhii!</p>
        </div>
      </div>
    </DashboardShell>
  );
}
