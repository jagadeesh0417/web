"use client";

import { useEffect, useState } from "react";
import {
  Users, Briefcase, GraduationCap, BookOpen, FileStack, Award, IndianRupee, Percent,
  Globe2, LifeBuoy, FolderKanban,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getApplications, getCertificates, getPayments } from "@/lib/data/repository";
import { analytics } from "@/lib/data/sample-data";
import { formatCurrency } from "@/lib/utils";
import type { AppUser } from "@/lib/types";

const PIE_COLORS = ["#8b5cf6", "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#64748b"];

export default function AdminDashboard() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const applications = getApplications();
  const certificates = getCertificates();
  const payments = getPayments();
  const revenue = payments.filter((p) => p.status === "succeeded").reduce((a, p) => a + p.amount, 0);

  const stats = [
    { title: "Total users", value: String(analytics.totalUsers), delta: 18, icon: Users, gradient: "from-violet-600 to-indigo-600" },
    { title: "Total clients", value: String(analytics.totalClients), delta: 6, icon: Briefcase, gradient: "from-blue-600 to-cyan-500" },
    { title: "Total interns", value: String(analytics.totalInterns), delta: 22, icon: GraduationCap, gradient: "from-emerald-600 to-teal-500" },
    { title: "Active internships", value: String(analytics.activeInternships), delta: 2, icon: BookOpen, gradient: "from-fuchsia-600 to-pink-600" },
    { title: "Applications", value: String(applications.length), delta: 9, icon: FileStack, gradient: "from-amber-500 to-orange-600" },
    { title: "Certificates issued", value: String(certificates.length), delta: 12, icon: Award, gradient: "from-purple-600 to-violet-500" },
    { title: "Revenue", value: formatCurrency(revenue), delta: 24, icon: IndianRupee, gradient: "from-emerald-500 to-green-600" },
    { title: "Conversion rate", value: `${analytics.conversionRate}%`, delta: 1.2, icon: Percent, gradient: "from-sky-500 to-blue-600" },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Admin analytics"
        description="Platform-wide performance — users, internships, revenue and more."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Growth overview</CardTitle>
            <CardDescription>Users & website visitors, last 8 months</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.usersByMonth} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#0ea5e9" fill="url(#gVisitors)" />
                <Area type="monotone" dataKey="users" name="Users" stroke="#8b5cf6" fill="url(#gUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications by category</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.applicationsByCategory} dataKey="count" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {analytics.applicationsByCategory.map((_, i) => (
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs expenses</CardTitle>
            <CardDescription>Monthly, in INR</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.revenueByMonth} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickFormatter={(v: number) => `${v / 100000}L`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#64748b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live platform stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Globe2, label: "Website visitors (30d)", value: analytics.websiteVisitors.toLocaleString("en-IN") },
              { icon: LifeBuoy, label: "Open support tickets", value: String(analytics.supportTickets) },
              { icon: FolderKanban, label: "Projects in progress", value: String(analytics.projectStatus.in_progress + analytics.projectStatus.review) },
              { icon: Briefcase, label: "Completed projects", value: String(analytics.projectStatus.completed) },
              { icon: Award, label: "Certificates verified", value: "1,240" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-xl border border-border p-3.5">
                <span className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <row.icon className="h-4 w-4 text-brand-500" /> {row.label}
                </span>
                <span className="font-bold">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
