import { cn } from "@/lib/utils";

export function ProcessTimeline({
  steps,
  gradient,
}: {
  steps: { step: string; title: string; description: string }[];
  gradient: string;
}) {
  return (
    <div>
      {/* Horizontal stepper — desktop */}
      <div className="hidden lg:block">
        <div className="flex items-start">
          {steps.map((s, i) => (
            <div key={s.step} className="flex flex-1 items-start">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-lg",
                    gradient,
                  )}
                >
                  {s.step}
                </span>
                {i < steps.length - 1 && (
                  <div className="mt-2 h-px w-full bg-gradient-to-r from-brand-500/60 to-brand-500/20" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <p className="font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-4 mt-6 hidden h-px flex-1 bg-border lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vertical timeline — mobile */}
      <div className="lg:hidden">
        <ol className="relative space-y-8 border-l border-border/60 pl-6">
          {steps.map((s) => (
            <li key={s.step} className="relative">
              <span
                className={cn(
                  "absolute -left-[31px] flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow-md",
                  gradient,
                )}
              >
                {s.step}
              </span>
              <p className="font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
