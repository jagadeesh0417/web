"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}

const TabsContext = createContext<TabsContextValue>({ value: "", setValue: () => {} });

export function Tabs({ defaultValue, value, onValueChange, className, children }: { defaultValue?: string; value?: string; onValueChange?: (v: string) => void; className?: string; children: React.ReactNode }) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = value ?? internal;
  const setValue = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("inline-flex items-center gap-1 rounded-lg bg-muted p-1", className)}>{children}</div>;
}

export function TabsTrigger({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;
  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={cn("mt-4", className)}>{children}</div>;
}
