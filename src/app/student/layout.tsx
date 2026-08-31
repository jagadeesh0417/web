"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, FileText, Award, User, LifeBuoy,
  GraduationCap, ClipboardCheck, FolderKanban, FileCheck, Globe,
  LogOut, X, Menu, Clock, Bell, Download, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { getSession, signOut } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import type { AppUser } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, BookOpen, FileText, Award, User, LifeBuoy,
  GraduationCap, ClipboardCheck, FolderKanban, FileCheck, Globe, Clock, Download,
};

const studentNav = [
  { href: "/student", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/student/internship", label: "My Internship", icon: "GraduationCap" },
  { href: "/student/modules", label: "Course Modules", icon: "BookOpen" },
  { href: "/student/timeline", label: "Timeline", icon: "Clock" },
  { href: "/student/assignments", label: "Assignments", icon: "FileText" },
  { href: "/student/projects", label: "Projects", icon: "FolderKanban" },
  { href: "/student/submissions", label: "Submissions", icon: "FileCheck" },
  { href: "/student/assessment", label: "Assessment", icon: "ClipboardCheck" },
  { href: "/student/resources", label: "Resources", icon: "Download" },
  { href: "/student/certificate", label: "Certificate", icon: "Award" },
  { href: "/student/profile", label: "Profile", icon: "User" },
  { href: "/student/support", label: "Support", icon: "LifeBuoy" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getSession().then(({ user }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setUser(user);
      setReady(true);
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/student/notifications")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.unreadCount ?? 0))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-800 bg-zinc-900 text-white transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center border-b border-zinc-800 transition-all",
          collapsed ? "justify-center px-2" : "justify-between px-5",
        )}>
          {collapsed ? (
            <Link href="/student" className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-black text-white">
              A
            </Link>
          ) : (
            <Logo href="/student" />
          )}
          <button
            className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            className="lg:hidden text-zinc-400"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="border-b border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
                {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-zinc-400">{user.email}</p>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="primary" className="text-[10px]">
                {user.role === "intern" ? "Intern" : user.role === "applicant" ? "Applicant" : user.role}
              </Badge>
            </div>
          </div>
        )}

        {/* Collapsed user avatar */}
        {collapsed && (
          <div className="flex justify-center border-b border-zinc-800 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[10px] font-bold text-white">
              {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2 scrollbar-thin">
          {studentNav.map((item) => {
            const Icon = iconMap[item.icon] ?? LayoutDashboard;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  active
                    ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 text-violet-300"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {item.label === "Support" && unreadCount > 0 && !collapsed && (
                  <Badge variant="destructive" className="ml-auto text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-zinc-800 p-2">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? "Back to website" : undefined}
          >
            <Globe className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Back to website</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white",
              collapsed && "justify-center px-2",
            )}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        "flex min-w-0 flex-1 flex-col transition-all duration-300",
        collapsed ? "lg:pl-[68px]" : "lg:pl-64",
      )}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">
                Welcome back, {user.name.split(" ")[0]}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Student Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/student/support"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-1.5 py-1 pr-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[11px] font-bold text-white">
                {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <span className="hidden text-sm font-medium sm:block">{user.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

        <footer className="border-t border-border px-6 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Akradhii Digital Growth Studio · Student Portal
        </footer>
      </div>
    </div>
  );
}
