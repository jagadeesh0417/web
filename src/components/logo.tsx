import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/", size = "md" }: { className?: string; href?: string; size?: "sm" | "md" | "lg" }) {
  const mark = size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Akradhii home">
      <span
        className={cn(
          "flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-700 text-sm font-black text-white shadow-lg shadow-orange-600/30 transition-transform group-hover:scale-105",
          mark,
        )}
      >
        A
      </span>
      <span className={cn("font-bold tracking-tight text-foreground", text)}>
        Akra<span className="text-gradient">dhii</span>
      </span>
    </Link>
  );
}