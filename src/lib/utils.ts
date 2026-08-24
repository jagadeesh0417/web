export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(input: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", opts ?? { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCurrency(amount: number, currency = "INR"): string {
  if (currency === "USD") return `$${amount.toLocaleString("en-US")}`;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function truncate(text: string, length = 60): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length - 1)}…`;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function timeAgo(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function daysBetween(start: string | Date, end: string | Date): number {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  return Math.round((b - a) / 86400000);
}

export function addDays(date: string | Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function percent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function randomId(len = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const arr = new Uint32Array(len);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < len; i++) arr[i] = Math.floor(Math.random() * 1e9);
  }
  for (let i = 0; i < len; i++) out += chars[arr[i]! % chars.length];
  return out;
}

export function certificateId(): string {
  const year = new Date().getFullYear();
  return `AKR-${year}-${randomId(8)}`;
}

export function fileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
