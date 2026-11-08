import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/", size = "md" }: { className?: string; href?: string; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "h-[88px] w-[88px]" : size === "sm" ? "h-14 w-14" : "h-[72px] w-[72px]";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Akradhii home">
      <Image
        src="/logo.png"
        alt="Akradhii AR logo"
        width={128}
        height={128}
        priority
        className={cn("object-contain transition-transform group-hover:scale-105", cls)}
      />
      <span className={cn("font-bold tracking-tight text-foreground", text)}>
        Akra<span className="text-gradient">dhii</span>
      </span>
    </Link>
  );
}