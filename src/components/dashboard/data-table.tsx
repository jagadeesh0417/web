"use client";

import { useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search…",
  searchKeys = [],
  filters,
  filterRows,
  pageSize = 8,
}: {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  filters?: { label: string; options: string[]; selected?: string }[];
  filterRows?: (row: T, filterValues: Record<string, string>) => boolean;
  pageSize?: number;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = data;
    if (q) {
      rows = rows.filter((row) =>
        searchKeys.some((key) => {
          const value = (row as Record<string, unknown>)[key];
          return String(value ?? "").toLowerCase().includes(q);
        }),
      );
    }
    if (filterRows && filters && filters.some((f) => (filterValues[f.label] ?? f.selected ?? "all") !== "all")) {
      rows = rows.filter((row) => filterRows(row, filterValues));
    }
    return rows;
  }, [data, query, searchKeys, filterRows, filterValues, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        {filters && filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Select
                key={f.label}
                className="w-44"
                value={filterValues[f.label] ?? f.selected ?? "all"}
                onChange={(e) => {
                  setFilterValues((v) => ({ ...v, [f.label]: e.target.value }));
                  setPage(1);
                }}
              >
                <option value="all">{f.label}: All</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card scrollbar-thin">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              {columns.map((c) => (
                <th key={c.key} className={cn("px-4 py-3 font-semibold", c.className)}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/50">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3", c.className)}>{c.cell(row)}</td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {safePage} of {totalPages} · {filtered.length} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
