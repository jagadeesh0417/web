"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, FileText, Video, CalendarCheck, Award, MessageSquare, User,
  Users, ClipboardCheck, Megaphone, FolderKanban, Receipt, LifeBuoy, CheckSquare, Clock,
  BarChart3, FileStack, GraduationCap, PenLine, Globe, Quote, CreditCard, FileBarChart,
  Download, LogOut, X, Mail, ShieldCheck, Inbox,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { navForRole, homeForRole, ROLE_LABEL } from "@/lib/rbac";
import { getSession, signOut, demoMode } from "@/lib/auth";
import type { AppUser } from "@/lib/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, BookOpen, FileText, Video, CalendarCheck, Award, MessageSquare, User,
  Users, ClipboardCheck, Megaphone, FolderKanban, Receipt, LifeBuoy, CheckSquare, Clock,
  BarChart3, FileStack, GraduationCap, PenLine, Globe, Quote, CreditCard, FileBarChart,
  Download, Mail, ShieldCheck, Inbox,
};

export function DashboardShell({ children, requiredRoles }: { children: React.ReactNode; requiredRoles?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    getSession().then(({ user }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (requiredRoles && !requiredRoles.includes(user.role)) {
        router.replace(homeForRole(user.role));
        return;
      }
      setUser(user);
      setReady(true);
    });
  }, [router, requiredRoles]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" />
      </div>
    );
  }

  const nav = navForRole(user.role);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Logo href={homeForRole(user.role)} />
          <button className="lg:hidden text-muted-foreground" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3 scrollbar-thin">
          {nav.map((item) => {
            const Icon = iconMap[item.icon] ?? LayoutDashboard;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-violet-600/15 to-indigo-600/10 text-brand-600 dark:text-brand-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4.5 w-4.5 h-[18px] w-[18px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Globe className="h-[18px] w-[18px] shrink-0" />
            Back to website
          </Link>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border glass px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">Welcome back, {user.name.split(" ")[0]}</p>
              <p className="text-[11px] text-muted-foreground">
                {ROLE_LABEL[user.role]} · {demoMode() ? "demo workspace" : "secure session"}
              </p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex h-10 items-center gap-2.5 rounded-full border border-border bg-card px-1.5 py-1 pr-3 hover:bg-muted transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[11px] font-bold text-white">
                {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
              </span>
              <span className="hidden text-sm font-medium sm:block">{user.name}</span>
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 z-40 mt-2 w-60 rounded-xl border border-border bg-card p-2 shadow-xl animate-fade-up">
                  <div className="border-b border-border px-3 pb-3 pt-2">
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="pt-2">
                    <Link href={`/${user.role === "intern" || user.role === "applicant" ? "student" : user.role === "super_admin" ? "admin" : user.role}/profile`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                      <User className="h-4 w-4" /> My profile
                    </Link>
                    <Link href={homeForRole(user.role)} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

        <footer className="border-t border-border px-6 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Akradhii Digital Growth Studio · Protected by role-based access control
        </footer>
      </div>
    </div>
  );
}
