import {
  PaintRoller,
  Paintbrush,
  Droplet,
  Layers,
  Wrench,
  Home,
  Sparkles,
  Sun,
  Package,
  Grid3x3,
  Tag,
  Palette,
  Brush,
  SprayCan,
  Hammer,
  Ruler,
  Building2,
  DoorOpen,
  Fence,
  TreePine,
  Car,
  Warehouse,
  ShowerHead,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

// Espelha ICONES em `Nova era tintas painel adm/src/app/(admin)/produtos/categorias/page.tsx`.
// Mantenha os dois em sincronia ao adicionar um novo ícone de categoria.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  roller: PaintRoller,
  brush: Paintbrush,
  brush2: Brush,
  spray: SprayCan,
  droplet: Droplet,
  palette: Palette,
  layers: Layers,
  wrench: Wrench,
  hammer: Hammer,
  ruler: Ruler,
  home: Home,
  building: Building2,
  door: DoorOpen,
  fence: Fence,
  tree: TreePine,
  car: Car,
  warehouse: Warehouse,
  shower: ShowerHead,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  sun: Sun,
  package: Package,
  grid: Grid3x3,
  tag: Tag,
};

export function CategoryIcon({
  icone,
  size = 24,
  color = "currentColor",
  strokeWidth = 1.8,
}: {
  icone: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const LucideCmp = CATEGORY_ICONS[icone] ?? Package;
  return <LucideCmp size={size} color={color} strokeWidth={strokeWidth} aria-hidden />;
}
