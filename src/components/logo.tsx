import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/", size = "md" }: { className?: string; href?: string; size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? 44 : size === "sm" ? 28 : 36;
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Akradhii home">
      <Image
        src="/logo.png"
        alt="Akradhii AR logo"
        width={dim}
        height={dim}
        priority
        className="h-auto w-auto transition-transform group-hover:scale-105"
      />
      <span className={cn("font-bold tracking-tight text-foreground", text)}>
        Akra<span className="text-gradient">dhii</span>
      </span>
    </Link>
  );
}