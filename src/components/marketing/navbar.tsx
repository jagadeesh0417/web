"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  ChevronDown,
  Code2,
  Megaphone,
  Workflow,
  Database,
  BrainCircuit,
  Search,
  Palette,
  GraduationCap,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSession, signOut } from "@/lib/auth";
import type { AppUser } from "@/lib/types";
import { homeForRole } from "@/lib/rbac";
import { useToast } from "@/components/ui/toast";
import { services } from "@/config/site";
import { PROGRAMS } from "@/lib/constants";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Megaphone,
  Workflow,
  Database,
  BrainCircuit,
  Search,
  Palette,
};

const serviceLinks = services.map((s) => {
  const Icon = icons[s.icon as keyof typeof icons] ?? Code2;
  return {
    href: `/services/${s.id}`,
    label: s.title,
    desc: `${s.description.slice(0, 58)}...`,
    icon: Icon,
  };
});

const internshipLinks = [
  { href: "/internships", label: "All internships", desc: "Explore programs and tracks.", icon: GraduationCap },
  ...PROGRAMS.map((p) => ({
    href: `/internships/apply?program=${p.slug}`,
    label: p.title,
    desc: `${p.duration} - Rs. ${p.price.toLocaleString("en-IN")}`,
    icon: Briefcase,
  })),
];

const resourcesLinks = [
  { href: "/resources", label: "Resources", desc: "Guides, tools and templates." },
  { href: "/blog", label: "Blog", desc: "Insights on growth, design and tech." },
  { href: "/verify", label: "Certificate verification", desc: "Verify issued certificates." },
];

type DropdownItem = {
  href: string;
  label: string;
  desc?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

function Dropdown({
  label,
  href,
  items,
  isActive,
}: {
  label: string;
  href: string;
  items: DropdownItem[];
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setPinned(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setPinned(false);
        if (ref.current?.contains(document.activeElement)) triggerRef.current?.focus();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative hidden lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { if (!pinned && !ref.current?.contains(document.activeElement)) setOpen(false); }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setPinned(false);
        }
      }}
    >
      <button
        type="button"
        ref={triggerRef}
        aria-expanded={open}
        aria-current={isActive ? "page" : undefined}
        onClick={() => {
          setOpen(!pinned);
          setPinned(!pinned);
        }}
        className={cn(
          "nav-link relative flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-muted",
          isActive ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 w-72 pt-2"
        >
          <div className="origin-top-left rounded-xl border border-border bg-[#18191F] p-2 shadow-2xl">
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => { setOpen(false); setPinned(false); }}
                  className="group flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-[#222329]"
                >
                  {Icon && (
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#423020] bg-[#111216] text-[#F4BD53]">
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-[#F4BD53]">{item.label}</p>
                    {item.desc && <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-2 border-t border-border pt-2">
            <Link
              href={href}
              onClick={() => { setOpen(false); setPinned(false); }}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-semibold text-[#F4BD53] transition-colors hover:bg-[#222329]"
            >
              View all {label.toLowerCase()} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [mobileSections, setMobileSections] = useState<Record<string, boolean>>({});
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

  const toggleMobileSection = (key: string) => {
    setMobileSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#423020]/60 bg-[#090A0D]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 lg:flex">
          <Link
            href="/"
            aria-current={isActive("/") ? "page" : undefined}
            className={cn(
              "nav-link relative rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-muted",
              isActive("/") ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Home
          </Link>
          <Link
            href="/about"
            aria-current={isActive("/about") ? "page" : undefined}
            className={cn(
              "nav-link relative rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-muted",
              isActive("/about") ? "text-foreground" : "text-muted-foreground",
            )}
          >
            About
          </Link>
          <Dropdown label="Services" href="/services" items={serviceLinks} isActive={isActive("/services")} />
          <Dropdown label="Internships" href="/internships" items={internshipLinks} isActive={isActive("/internships")} />
          <Link
            href="/portfolio"
            aria-current={isActive("/portfolio") ? "page" : undefined}
            className={cn(
              "nav-link relative rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-muted",
              isActive("/portfolio") ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Portfolio
          </Link>
          <Dropdown label="Resources" href="/resources" items={resourcesLinks} isActive={isActive("/resources") || isActive("/blog")} />
          <Link
            href="/contact"
            aria-current={isActive("/contact") ? "page" : undefined}
            className={cn(
              "nav-link relative rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-muted",
              isActive("/contact") ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Contact
          </Link>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/contact"
            className="inline-flex min-h-9 items-center gap-2 rounded-full bg-gradient-to-r from-[#F4BD53] via-[#F58216] to-[#C75A19] px-4 text-xs font-bold text-[#090A0D] shadow-lg shadow-orange-900/30 transition hover:brightness-110"
          >
            Start a Project <ArrowRight className="h-3.5 w-3.5" />
          </Link>
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
            <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
              Log in
            </Button>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-navigation"
          className="animate-fade-up border-t border-border bg-card text-card-foreground lg:hidden"
        >
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            <Link
              href="/"
              aria-current={isActive("/") ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive("/") ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              Home
            </Link>
            <Link
              href="/about"
              aria-current={isActive("/about") ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive("/about") ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              About
            </Link>

            {/* Services mobile group */}
            <div>
              <button
                type="button"
                aria-expanded={!!mobileSections.services}
                onClick={() => toggleMobileSection("services")}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                Services
                <ChevronDown className={cn("h-4 w-4 transition-transform", mobileSections.services && "rotate-180")} />
              </button>
              {mobileSections.services && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                  {serviceLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/services"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#F4BD53]"
                  >
                    All services
                  </Link>
                </div>
              )}
            </div>

            {/* Internships mobile group */}
            <div>
              <button
                type="button"
                aria-expanded={!!mobileSections.internships}
                onClick={() => toggleMobileSection("internships")}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                Internships
                <ChevronDown className={cn("h-4 w-4 transition-transform", mobileSections.internships && "rotate-180")} />
              </button>
              {mobileSections.internships && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                  {internshipLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/portfolio"
              aria-current={isActive("/portfolio") ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive("/portfolio") ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              Portfolio
            </Link>

            {/* Resources mobile group */}
            <div>
              <button
                type="button"
                aria-expanded={!!mobileSections.resources}
                onClick={() => toggleMobileSection("resources")}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground"
              >
                Resources
                <ChevronDown className={cn("h-4 w-4 transition-transform", mobileSections.resources && "rotate-180")} />
              </button>
              {mobileSections.resources && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                  {resourcesLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/contact"
              aria-current={isActive("/contact") ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive("/contact") ? "bg-muted text-foreground" : "text-muted-foreground",
              )}
            >
              Contact
            </Link>

            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F4BD53] via-[#F58216] to-[#C75A19] px-4 text-sm font-bold text-[#090A0D] shadow-lg shadow-orange-900/30"
              >
                Start a Project <ArrowRight className="h-3.5 w-3.5" />
              </Link>
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
