import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-black text-white shadow-lg shadow-violet-600/30 transition-transform group-hover:scale-105">
        A
      </span>
      <span className="text-xl font-bold tracking-tight">
        Akra<span className="text-gradient">dhii</span>
      </span>
    </Link>
  );
}
