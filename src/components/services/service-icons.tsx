import {
  Bot,
  Globe,
  LayoutGrid,
  Megaphone,
  Palette,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const serviceIconMap: Record<string, LucideIcon> = {
  Code2: Globe,
  Megaphone: TrendingUp,
  Workflow: Zap,
  Database: LayoutGrid,
  BrainCircuit: Bot,
  Search,
  Palette: Sparkles,
};

export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = serviceIconMap[name] ?? Globe;
  return <Icon className={className} />;
}
