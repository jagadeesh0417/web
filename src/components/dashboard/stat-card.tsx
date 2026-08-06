import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  hint,
  delta,
  deltaLabel,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string;
  hint?: string;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  gradient: string;
}) {
  return (
    <Card className="p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-2xl font-extrabold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white", gradient)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof delta === "number" && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "flex items-center gap-0.5 font-semibold",
              delta > 0 && "text-success",
              delta < 0 && "text-destructive",
              delta === 0 && "text-muted-foreground",
            )}
          >
            {delta > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : delta < 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground">{deltaLabel ?? "vs last month"}</span>
        </div>
      )}
    </Card>
  );
}
