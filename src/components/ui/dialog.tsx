"use client";

import { createContext, useContext, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

const DialogContext = createContext<{
  confirm: (opts: DialogOptions) => Promise<boolean>;
}>({ confirm: async () => false });

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(DialogOptions & { resolve: (v: boolean) => void }) | null>(null);

  const confirm = (opts: DialogOptions) =>
    new Promise<boolean>((resolve) => setState({ ...opts, resolve }));

  const close = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  return (
    <DialogContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => close(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-up">
            <button onClick={() => close(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-semibold">{state.title}</h3>
            {state.description && <p className="mt-1 text-sm text-muted-foreground">{state.description}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => close(false)}>
                {state.cancelLabel ?? "Cancel"}
              </Button>
              <Button variant={state.destructive ? "danger" : "primary"} onClick={() => close(true)}>
                {state.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  return useContext(DialogContext);
}
