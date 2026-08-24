import {
  Code2,
  Megaphone,
  Workflow,
  Database,
  BrainCircuit,
  Search,
  Palette,
  type LucideIcon,
} from "lucide-react";

export const serviceIconMap: Record<string, LucideIcon> = {
  Code2,
  Megaphone,
  Workflow,
  Database,
  BrainCircuit,
  Search,
  Palette,
};

export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = serviceIconMap[name] ?? Code2;
  return <Icon className={className} />;
}
