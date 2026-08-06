import { cn } from "@/lib/utils";

export function Progress({ value, className, indicatorClassName }: { value: number; className?: string; indicatorClassName?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500", indicatorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500", className)}
      aria-label="Loading"
    />
  );
}
