"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSession, signOut } from "@/lib/auth";
import type { AppUser } from "@/lib/types";
import { homeForRole } from "@/lib/rbac";
import { useToast } from "@/components/ui/toast";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/internships", label: "Internships" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    toast("success", "Signed out", "You have been logged out securely.");
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-0.5 xl:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted",
                isActive(l.href) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {ready && user ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push(homeForRole(user.role))}>
                <ChevronDown className="h-3.5 w-3.5" />
                Dashboard
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
              Log in
            </Button>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border xl:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card xl:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(l.href) ? "bg-muted text-foreground" : "text-muted-foreground",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center">
              {ready && user ? (
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    router.push("/login");
                  }}
                >
                  Log in
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
