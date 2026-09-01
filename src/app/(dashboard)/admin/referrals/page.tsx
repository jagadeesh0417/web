"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, IndianRupee, Activity, CheckCircle2, XCircle,
  Ban, Loader2, Search, X,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader, EmptyState } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Reveal } from "@/components/marketing/reveal";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Referral {
  id: string;
  referrerEmail: string;
  referrerName: string;
  referredEmail: string;
  referredName: string;
  code: string;
  status: "pending" | "rewarded" | "expired";
  reward: number;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  method: string;
  upiId?: string;
  bankDetails?: string;
  status: "pending" | "approved" | "processing" | "paid" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

interface ReferralsResponse {
  referrals: Referral[];
  stats: {
    totalReferrals: number;
    successful: number;
    pending: number;
    totalRewards: number;
  };
}

interface WithdrawalsResponse {
  withdrawals: Withdrawal[];
  stats: {
    pending: number;
    approved: number;
    paid: number;
    rejected: number;
    totalPayout: number;
  };
}

type Tab = "withdrawals" | "referrals";

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const prefix = parts[0];
  const masked = prefix.length > 3 ? prefix.slice(0, 3) + "****" : prefix + "****";
  return `${masked}@${parts[1]}`;
}

const statusColors: Record<string, "warning" | "success" | "destructive" | "info" | "default"> = {
  pending: "warning",
  approved: "info",
  processing: "info",
  paid: "success",
  rejected: "destructive",
  rewarded: "success",
  expired: "default",
};

export default function AdminReferralsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("withdrawals");
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState<ReferralsResponse | null>(null);
  const [withdrawalData, setWithdrawalData] = useState<WithdrawalsResponse | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; open: boolean }>({ id: "", open: false });
  const [rejectionReason, setRejectionReason] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [refRes, withRes] = await Promise.all([
        fetch("/api/admin/referrals"),
        fetch("/api/admin/withdrawals"),
      ]);

      if (refRes.ok) setReferralData(await refRes.json());
      if (withRes.ok) setWithdrawalData(await withRes.json());
    } catch {
      toast("error", "Failed to load data", "Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleWithdrawalAction = async (id: string, status: string, reason?: string) => {
    setProcessingId(id);
    try {
      const body: Record<string, string> = { status };
      if (reason) body.reason = reason;

      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Action failed");

      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
      toast("success", "Withdrawal updated", `Withdrawal request ${statusLabel.toLowerCase()} successfully.`);
      setRejectModal({ id: "", open: false });
      setRejectionReason("");
      await fetchData();
    } catch {
      toast("error", "Action failed", "Could not update withdrawal status.");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectModal({ id, open: true });
    setRejectionReason("");
  };

  const filteredWithdrawals = withdrawalData?.withdrawals.filter(
    (w) =>
      w.userName.toLowerCase().includes(search.toLowerCase()) ||
      w.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      w.method.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredReferrals = referralData?.referrals.filter(
    (r) =>
      r.referrerName.toLowerCase().includes(search.toLowerCase()) ||
      r.referrerEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.referredName.toLowerCase().includes(search.toLowerCase()) ||
      r.referredEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <DashboardShell requiredRoles={["admin", "super_admin"]}>
      <PageHeader
        title="Referrals & Withdrawals"
        description="Manage referral rewards and process withdrawal requests."
        actions={<Badge variant="outline">{tab === "withdrawals" ? "Withdrawal Management" : "Referral Tracking"}</Badge>}
      />

      {/* Stats Section */}
      <Reveal>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Referral Statistics */}
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-brand-500" />
                Referral Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Total Referrals</p>
                  <p className="text-xl font-bold">{referralData?.stats.totalReferrals ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Successful</p>
                  <p className="text-xl font-bold text-success">{referralData?.stats.successful ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold text-warning">{referralData?.stats.pending ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Total Rewards</p>
                  <p className="text-xl font-bold text-brand-500">{referralData?.stats.totalRewards != null ? formatCurrency(referralData.stats.totalRewards) : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Statistics */}
          <Card className="sm:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <IndianRupee className="h-4 w-4 text-brand-500" />
                Withdrawal Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold text-warning">{withdrawalData?.stats.pending ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Approved</p>
                  <p className="text-xl font-bold text-info">{withdrawalData?.stats.approved ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Paid</p>
                  <p className="text-xl font-bold text-success">{withdrawalData?.stats.paid ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Rejected</p>
                  <p className="text-xl font-bold text-destructive">{withdrawalData?.stats.rejected ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">Total Payout</p>
                  <p className="text-xl font-bold text-brand-500">{withdrawalData?.stats.totalPayout != null ? formatCurrency(withdrawalData.stats.totalPayout) : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Reveal>

      {/* Tabs */}
      <div className="mb-5 inline-flex items-center gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => { setTab("withdrawals"); setSearch(""); }}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
            tab === "withdrawals" ? "bg-card shadow-sm" : "text-muted-foreground"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          Withdrawals
          {withdrawalData?.withdrawals.filter((w) => w.status === "pending").length ? (
            <span className="ml-1 rounded-full bg-warning/20 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
              {withdrawalData.withdrawals.filter((w) => w.status === "pending").length}
            </span>
          ) : null}
        </button>
        <button
          onClick={() => { setTab("referrals"); setSearch(""); }}
          className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
            tab === "referrals" ? "bg-card shadow-sm" : "text-muted-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Referrals
          {referralData?.referrals.length ? (
            <span className="ml-1 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {referralData.referrals.length}
            </span>
          ) : null}
        </button>
      </div>

      {/* Search */}
      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "withdrawals" ? "Search by name, email, or method..." : "Search by name, email, or code..."}
            className="pl-9"
          />
        </div>
        {search && (
          <Button variant="ghost" size="sm" onClick={() => setSearch("")} className="text-muted-foreground">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <Card className="overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </Card>
      ) : tab === "withdrawals" ? (
        /* Withdrawals Tab */
        filteredWithdrawals.length === 0 ? (
          <EmptyState
            icon={<IndianRupee className="h-10 w-10" />}
            title="No withdrawal requests"
            description={search ? "Try a different search term." : "No withdrawal requests have been submitted yet."}
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Method</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{w.userName}</p>
                          <p className="text-xs text-muted-foreground">{maskEmail(w.userEmail)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold">{formatCurrency(w.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="info">{w.method}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(w.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColors[w.status] ?? "default"}>{w.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {w.status === "pending" && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleWithdrawalAction(w.id, "approved")}
                                loading={processingId === w.id}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => openRejectModal(w.id)}
                                disabled={processingId === w.id}
                              >
                                <Ban className="h-3.5 w-3.5" /> Reject
                              </Button>
                            </>
                          )}
                          {w.status === "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWithdrawalAction(w.id, "processing")}
                              loading={processingId === w.id}
                            >
                              <Loader2 className="h-3.5 w-3.5" /> Mark Processing
                            </Button>
                          )}
                          {w.status === "processing" && (
                            <Button
                              variant="gradient"
                              size="sm"
                              onClick={() => handleWithdrawalAction(w.id, "paid")}
                              loading={processingId === w.id}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Paid
                            </Button>
                          )}
                          {w.status === "rejected" && (
                            <span className="text-xs text-muted-foreground italic">
                              {w.rejectionReason ? `Re: ${w.rejectionReason.slice(0, 30)}...` : "Rejected"}
                            </span>
                          )}
                          {w.status === "paid" && (
                            <span className="flex items-center gap-1 text-xs text-success">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        /* Referrals Tab */
        filteredReferrals.length === 0 ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="No referrals found"
            description={search ? "Try a different search term." : "No referrals have been made yet."}
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Referrer</th>
                    <th className="px-4 py-3 text-left">Referred User</th>
                    <th className="px-4 py-3 text-left">Code</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Reward</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredReferrals.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{r.referrerName}</p>
                          <p className="text-xs text-muted-foreground">{maskEmail(r.referrerEmail)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{r.referredName}</p>
                          <p className="text-xs text-muted-foreground">{maskEmail(r.referredEmail)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-muted px-2 py-1 text-xs font-mono">{r.code}</code>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColors[r.status] ?? "default"}>{r.status}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {r.status === "rewarded" ? formatCurrency(r.reward) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-up">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Reject Withdrawal</h3>
                <p className="text-sm text-muted-foreground">Provide a reason for rejection.</p>
              </div>
            </div>
            <div className="mt-4">
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={3}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setRejectModal({ id: "", open: false })}
                disabled={processingId === rejectModal.id}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={processingId === rejectModal.id}
                onClick={() => handleWithdrawalAction(rejectModal.id, "rejected", rejectionReason)}
              >
                Reject Withdrawal
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
