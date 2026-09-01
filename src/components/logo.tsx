import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Akradhii home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-9 w-9 shrink-0 transition-transform group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-violet-600, #7c3aed)" />
            <stop offset="100%" stopColor="var(--color-indigo-600, #4f46e5)" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="10" fill="url(#logo-grad)" />
        <path
          d="M18 8L10 28h3.2l1.6-4.4h4.8L21 28h3.2L26 8h-3.4l-1.8 5.8h-3.6L17.2 8H18zm1.2 3.4l-1.4 4h2.8l-1.4-4z"
          fill="white"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight">
        Akra<span className="text-gradient">dhii</span>
      </span>
    </Link>
  );
}
