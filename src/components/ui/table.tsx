import { cn } from "@/lib/utils";

export function Table({ className, children }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin">
      <table className={cn("w-full text-left text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ className, children }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground", className)}>{children}</thead>;
}

export function TableBody({ className, children }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-border", className)}>{children}</tbody>;
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("transition-colors hover:bg-muted/50", className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-4 py-3 font-semibold", className)}>{children}</th>;
}

export function TableCell({ className, children }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}
