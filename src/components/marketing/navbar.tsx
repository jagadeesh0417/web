"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun, X, LogOut, ChevronDown } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSession, signOut } from "@/lib/auth";
import type { AppUser } from "@/lib/types";
import { homeForRole } from "@/lib/rbac";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/ui/toast";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/internships", label: "Internships" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-amber-500/30 bg-[#090A0D]/85 backdrop-blur-xl shadow-lg shadow-black/30"
          : "border-b border-transparent bg-[#090A0D]/60 backdrop-blur-md",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 transition-all duration-300 sm:px-6 lg:px-8",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Logo size="sm" />

        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5",
                isActive(l.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
              <span
                className={cn(
                  "absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 transition-all duration-300",
                  isActive(l.href) ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0",
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-amber-500/40 hover:text-amber-400"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
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
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                Log in
              </Button>
              <Button variant="gradient" size="sm" onClick={() => router.push("/contact")}>
                Book a Consultation
              </Button>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-[#090A0D]/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(l.href)
                    ? "bg-amber-500/10 text-amber-400"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <Button variant="gradient" className="w-full" onClick={() => { setOpen(false); router.push("/contact"); }}>
                Book a Consultation
              </Button>
              {ready && user && (
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              )}
              {!ready || !user ? (
                <Button variant="ghost" className="w-full" onClick={() => { setOpen(false); router.push("/login"); }}>
                  Log in
                </Button>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}