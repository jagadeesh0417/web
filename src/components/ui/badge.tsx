import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "success" | "warning" | "destructive" | "outline" | "info";

const styles: Record<Variant, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-brand-600/10 text-brand-600 dark:text-brand-300",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  outline: "border border-border text-muted-foreground",
};

export function Badge({ className, variant = "default", children }: { className?: string; variant?: Variant; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
