import { cn, initials as toInitials } from "@/lib/utils";

const gradients = [
  "from-violet-600 to-indigo-600",
  "from-fuchsia-600 to-pink-600",
  "from-blue-600 to-cyan-500",
  "from-emerald-600 to-teal-500",
  "from-amber-500 to-orange-600",
  "from-purple-600 to-violet-500",
  "from-rose-500 to-red-500",
];

function gradientFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return gradients[h % gradients.length]!;
}

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
        gradientFor(name),
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt={name} className="h-full w-full rounded-full object-cover" /> : toInitials(name)}
    </div>
  );
}
