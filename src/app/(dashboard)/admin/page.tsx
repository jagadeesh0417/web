"use client";

import { useEffect, useState } from "react";
import {
  Users, GraduationCap, BookOpen, CreditCard, CheckCircle, FileText, Award, IndianRupee,
  Gift, Wallet, TrendingUp, DollarSign, Clock,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const PIE_COLORS = ["#8b5cf6", "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#64748b"];

interface AdminStats {
  totalStudents: number;
  activeInterns: number;
  totalEnrollments: number;
  pendingPayments: number;
  successfulPayments: number;
  pendingSubmissions: number;
  completedInternships: number;
  certificatesIssued: number;
  totalUsers: number;
  totalApplications: number;
  recentEnrollments: { id: string; enrollmentId: string; studentName: string; programTitle: string; status: string; startedAt: string }[];
  recentPayments: { id: string; amount: number; status: string; createdAt: string; studentId: string }[];
  recentCertificates: { id: string; certificateId: string; programTitle: string; issuedAt: string }[];
  revenueByMonth: { month: string; revenue: number }[];
  usersByRole: Record<string, number>;
  enrollmentsByStatus: Record<string, number>;
  referralStats: { total: number; successful: number; pending: number; totalRewards: number };
  withdrawalStats: { pending: number; approved: number; paid: number; rejected: number; totalPaid: number };
  revenueThisMonth: number;
  revenueToday: number;
  newUsersThisMonth: number;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-7 w-16 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then((data) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <PageHeader title="Admin analytics" description="Platform-wide performance — users, internships, revenue and more." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-72 animate-pulse rounded-xl border border-border bg-card" />
          <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-72 animate-pulse rounded-xl border border-border bg-card" />
          <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !stats) {
    return (
      <DashboardShell>
        <PageHeader title="Admin analytics" description="Platform-wide performance — users, internships, revenue and more." />
        <Card className="p-8 text-center">
          <p className="text-destructive font-medium">Failed to load dashboard data</p>
          <p className="mt-1 text-sm text-muted-foreground">{error ?? "Unknown error"}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Retry
          </button>
        </Card>
      </DashboardShell>
    );
  }

  const totalRevenue = stats.revenueByMonth.reduce((sum, m) => sum + m.revenue, 0);
  const rolesData = Object.entries(stats.usersByRole).map(([role, count]) => ({ name: role, count }));

  const statCards = [
    { title: "Total Students", value: stats.totalStudents.toLocaleString("en-IN"), icon: Users, gradient: "from-violet-600 to-indigo-600" },
    { title: "Active Interns", value: stats.activeInterns.toLocaleString("en-IN"), icon: GraduationCap, gradient: "from-emerald-600 to-teal-500" },
    { title: "Total Enrollments", value: stats.totalEnrollments.toLocaleString("en-IN"), icon: BookOpen, gradient: "from-blue-600 to-cyan-500" },
    { title: "Pending Payments", value: stats.pendingPayments.toLocaleString("en-IN"), icon: CreditCard, gradient: "from-amber-500 to-orange-600" },
    { title: "Successful Payments", value: stats.successfulPayments.toLocaleString("en-IN"), icon: CheckCircle, gradient: "from-green-500 to-emerald-600" },
    { title: "Pending Submissions", value: stats.pendingSubmissions.toLocaleString("en-IN"), icon: FileText, gradient: "from-fuchsia-600 to-pink-600" },
    { title: "Completed Internships", value: stats.completedInternships.toLocaleString("en-IN"), icon: Award, gradient: "from-purple-600 to-violet-500" },
    { title: "Certificates Issued", value: stats.certificatesIssued.toLocaleString("en-IN"), icon: Award, gradient: "from-sky-500 to-blue-600" },
    { title: "Successful Referrals", value: stats.referralStats.successful.toLocaleString("en-IN"), icon: Gift, gradient: "from-pink-500 to-rose-500" },
    { title: "Rewards Paid", value: formatCurrency(stats.referralStats.totalRewards), icon: Wallet, gradient: "from-teal-500 to-cyan-500" },
    { title: "Withdrawals Pending", value: stats.withdrawalStats.pending.toLocaleString("en-IN"), icon: Clock, gradient: "from-orange-500 to-amber-500" },
    { title: "Withdrawals Paid", value: formatCurrency(stats.withdrawalStats.totalPaid), icon: IndianRupee, gradient: "from-emerald-600 to-green-500" },
    { title: "Revenue This Month", value: formatCurrency(stats.revenueThisMonth), icon: TrendingUp, gradient: "from-indigo-600 to-blue-500" },
    { title: "Revenue Today", value: formatCurrency(stats.revenueToday), icon: DollarSign, gradient: "from-violet-500 to-purple-500" },
    { title: "New Users This Month", value: stats.newUsersThisMonth.toLocaleString("en-IN"), icon: Users, gradient: "from-cyan-500 to-sky-500" },
  ];

  return (
    <DashboardShell>
      <PageHeader title="Admin analytics" description="Platform-wide performance — users, internships, revenue and more." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by month</CardTitle>
            <CardDescription>Last 6 months revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByMonth} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `${v / 100000}L`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users by role</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rolesData} dataKey="count" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {rolesData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentEnrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent enrollments</p>
            ) : (
              <div className="space-y-3">
                {stats.recentEnrollments.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/10 text-violet-600">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{e.studentName}</p>
                      <p className="text-xs text-muted-foreground truncate">{e.programTitle}</p>
                    </div>
                    <Badge variant={e.status === "active" ? "success" : e.status === "completed" ? "info" : "default"}>
                      {e.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent payments</p>
            ) : (
              <div className="space-y-3">
                {stats.recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600/10 text-green-600">
                      <IndianRupee className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <Badge variant={p.status === "succeeded" ? "success" : p.status === "pending" ? "warning" : "destructive"}>
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentCertificates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No certificates issued</p>
            ) : (
              <div className="space-y-3">
                {stats.recentCertificates.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.programTitle}</p>
                      <p className="text-xs text-muted-foreground">{new Date(c.issuedAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <Badge variant="success">Issued</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="mt-1 text-2xl font-bold">{stats.totalUsers.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="mt-1 text-2xl font-bold">{stats.totalApplications.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Total Revenue (6 mo)</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Completed Internships</p>
                <p className="mt-1 text-2xl font-bold">{stats.completedInternships.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <a href="/admin/audit-log" className="group">
          <Card className="transition-colors hover:border-brand-600">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quick Access</p>
                <p className="text-lg font-semibold group-hover:text-brand-600">Audit Log</p>
              </div>
            </CardContent>
          </Card>
        </a>
        <a href="/admin/pricing" className="group">
          <Card className="transition-colors hover:border-brand-600">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quick Access</p>
                <p className="text-lg font-semibold group-hover:text-brand-600">Pricing Management</p>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>
    </DashboardShell>
  );
}
