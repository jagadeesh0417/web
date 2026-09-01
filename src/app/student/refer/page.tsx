"use client";

import { useEffect, useState } from "react";
import {
  Gift,
  Copy,
  Check,
  Wallet,
  TrendingUp,
  Users,
  Clock,
  ArrowDownToLine,
  Share2,
  X,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Field, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { getSession } from "@/lib/auth";
import type { AppUser } from "@/lib/types";

interface WalletData {
  available: number;
  totalEarned: number;
  successfulReferrals: number;
  pending: number;
  isEligible: boolean;
  referralCode: string;
  referralLink: string;
}

interface ReferralHistoryEntry {
  id: string;
  date: string;
  referredUser: string;
  status: "completed" | "pending" | "failed";
  reward: number;
}

interface WithdrawalEntry {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: "completed" | "pending" | "processing" | "rejected";
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-500",
  pending: "bg-amber-500/10 text-amber-500",
  processing: "bg-blue-500/10 text-blue-500",
  failed: "bg-red-500/10 text-red-500",
  rejected: "bg-red-500/10 text-red-500",
};

export default function StudentReferPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralHistoryEntry[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalEntry[]>([]);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || !user) return;
    fetchWalletData();
    fetchReferralHistory();
    fetchWithdrawalHistory();
  }, [ready, user]);

  const fetchWalletData = async () => {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setWallet(data);
      } else {
        setWallet({
          available: 0,
          totalEarned: 0,
          successfulReferrals: 0,
          pending: 0,
          isEligible: false,
          referralCode: "",
          referralLink: "",
        });
      }
    } catch {
      setWallet({
        available: 0,
        totalEarned: 0,
        successfulReferrals: 0,
        pending: 0,
        isEligible: false,
        referralCode: "",
        referralLink: "",
      });
    }
  };

  const fetchReferralHistory = async () => {
    try {
      const res = await fetch("/api/referrals/history");
      if (res.ok) {
        const data = await res.json();
        setReferralHistory(Array.isArray(data) ? data : []);
      }
    } catch {
      setReferralHistory([]);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const res = await fetch("/api/withdrawals");
      if (res.ok) {
        const data = await res.json();
        setWithdrawalHistory(Array.isArray(data) ? data : []);
      }
    } catch {
      setWithdrawalHistory([]);
    }
  };

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast("success", "Copied!", `${type === "code" ? "Referral code" : "Referral link"} copied to clipboard.`);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast("error", "Failed to copy", "Please copy manually.");
    }
  };

  const shareOnWhatsApp = () => {
    if (!wallet?.referralLink) return;
    const message = encodeURIComponent(
      `Join using my referral link and get started! ${wallet.referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  if (!ready || !user) {
    return (
      <DashboardShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" />
        </div>
      </DashboardShell>
    );
  }

  if (wallet && !wallet.isEligible) {
    return (
      <DashboardShell>
        <PageHeader title="Refer & Earn" description="Share with friends and earn rewards." />
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Not Eligible Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You need to be an enrolled student to access the Refer &amp; Earn program.
                Purchase an internship program to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Refer & Earn"
        description="Share with friends and earn rewards."
      />

      {/* Hero Section */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600/20 via-brand-500/10 to-purple-600/20 border border-brand-500/20 p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="relative">
          <Badge variant="primary" className="mb-3">
            <Gift className="h-3 w-3" /> Refer &amp; Earn
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">
            Earn ₹20 for every friend who joins
          </h2>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Share your unique referral code with friends. When they enroll in any
            paid internship program, you earn ₹20 instantly.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Available Balance",
            value: `₹${wallet?.available?.toLocaleString("en-IN") ?? 0}`,
            icon: Wallet,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Total Earned",
            value: `₹${wallet?.totalEarned?.toLocaleString("en-IN") ?? 0}`,
            icon: TrendingUp,
            color: "text-brand-500",
            bg: "bg-brand-500/10",
          },
          {
            label: "Successful Referrals",
            value: String(wallet?.successfulReferrals ?? 0),
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Pending",
            value: `₹${wallet?.pending?.toLocaleString("en-IN") ?? 0}`,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Referral Code & Link */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-brand-500" /> Your Referral Code &amp; Link
          </CardTitle>
          <CardDescription>
            Share this code or link with your friends to earn rewards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Referral Code
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-border bg-muted/30 px-4 py-2.5 font-mono text-sm font-semibold text-foreground">
                  {wallet?.referralCode ?? "—"}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(wallet?.referralCode ?? "", "code")}
                >
                  {copied === "code" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Referral Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground">
                  {wallet?.referralLink ?? "—"}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(wallet?.referralLink ?? "", "link")}
                >
                  {copied === "link" ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <Button variant="gradient" onClick={shareOnWhatsApp}>
            <Share2 className="h-4 w-4" /> Share on WhatsApp
          </Button>
        </CardContent>
      </Card>

      {/* Withdraw Button */}
      <div className="mb-6">
        <Button
          variant="gradient"
          onClick={() => setShowWithdrawModal(true)}
          disabled={!wallet?.available || wallet.available < 200}
        >
          <ArrowDownToLine className="h-4 w-4" /> Withdraw Earnings
        </Button>
        {wallet && wallet.available > 0 && wallet.available < 200 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Minimum withdrawal amount is ₹200. You need ₹{200 - wallet.available} more.
          </p>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          balance={wallet?.available ?? 0}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={() => {
            setShowWithdrawModal(false);
            fetchWalletData();
            fetchWithdrawalHistory();
          }}
        />
      )}

      {/* Referral History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand-500" /> Referral History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referralHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No referrals yet. Share your code to get started!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Referred User</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {referralHistory.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50">
                      <td className="py-3 text-foreground">{entry.date}</td>
                      <td className="py-3 text-foreground">{entry.referredUser}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[entry.status] ?? ""}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium text-foreground">
                        {entry.status === "completed" ? `₹${entry.reward}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-brand-500" /> Withdrawal History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No withdrawals yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Method</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalHistory.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50">
                      <td className="py-3 text-foreground">{entry.date}</td>
                      <td className="py-3 font-medium text-foreground">₹{entry.amount}</td>
                      <td className="py-3 capitalize text-foreground">{entry.method.replace("_", " ")}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[entry.status] ?? ""}`}>
                          {entry.status}
                        </span>
                      </td>
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

function WithdrawModal({
  balance,
  onClose,
  onSuccess,
}: {
  balance: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank_transfer">("upi");
  const [upiId, setUpiId] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 200) {
      toast("error", "Invalid amount", "Minimum withdrawal is ₹200.");
      return;
    }
    if (amt > balance) {
      toast("error", "Insufficient balance", `You only have ₹${balance} available.`);
      return;
    }
    if (paymentMethod === "upi" && !upiId.trim()) {
      toast("error", "Missing UPI ID", "Please enter your UPI ID.");
      return;
    }
    if (paymentMethod === "bank_transfer") {
      if (!accountHolderName.trim() || !accountNumber.trim() || !ifsc.trim()) {
        toast("error", "Missing fields", "Please fill in all bank details.");
        return;
      }
    }

    setBusy(true);
    try {
      const payload: Record<string, unknown> = { amount: amt, paymentMethod };
      if (paymentMethod === "upi") {
        payload.upiId = upiId.trim();
      } else {
        payload.accountHolderName = accountHolderName.trim();
        payload.accountNumber = accountNumber.trim();
        payload.ifsc = ifsc.trim();
      }
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast("success", "Withdrawal Requested", "Your withdrawal is being processed.");
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        toast("error", "Failed", data.message || "Could not process withdrawal.");
      }
    } catch {
      toast("error", "Something went wrong", "Please try again later.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Withdraw Earnings</CardTitle>
            <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <CardDescription>
            Available balance: <span className="font-semibold text-foreground">₹{balance}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Amount (min ₹200)">
            <Input
              type="number"
              min={200}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>

          <Field label="Payment Method">
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "upi" | "bank_transfer")}
            >
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
            </Select>
          </Field>

          {paymentMethod === "upi" && (
            <Field label="UPI ID">
              <Input
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </Field>
          )}

          {paymentMethod === "bank_transfer" && (
            <>
              <Field label="Account Holder Name">
                <Input
                  placeholder="John Doe"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                />
              </Field>
              <Field label="Account Number">
                <Input
                  placeholder="Account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </Field>
              <Field label="IFSC Code">
                <Input
                  placeholder="SBIN0001234"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                />
              </Field>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="gradient" onClick={submit} loading={busy} disabled={busy} className="flex-1">
              {busy ? "Processing..." : "Submit Request"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
