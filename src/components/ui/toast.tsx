"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";

interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (kind: ToastKind, title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((kind: ToastKind, title: string, description?: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, title, description }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border bg-card p-4 shadow-lg animate-fade-up",
              t.kind === "success" && "border-success/30",
              t.kind === "error" && "border-destructive/30",
              t.kind === "info" && "border-border",
            )}
          >
            {t.kind === "success" && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />}
            {t.kind === "error" && <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />}
            {t.kind === "info" && <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />}
            <div className="flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>}
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
