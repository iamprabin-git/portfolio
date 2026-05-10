import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Braces,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Layers,
  LayoutGrid,
  Package,
  Palette,
  PenTool,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Terminal,
  Webhook,
  Zap,
} from "lucide-react";

/** Serializable keys stored on `Skill.icon`. */
export const SKILL_ICONS = {
  code: Code2,
  braces: Braces,
  terminal: Terminal,
  database: Database,
  globe: Globe,
  layers: Layers,
  cpu: Cpu,
  cloud: Cloud,
  mobile: Smartphone,
  palette: Palette,
  package: Package,
  git: GitBranch,
  shield: Shield,
  zap: Zap,
  layout: LayoutGrid,
  server: Server,
  webhook: Webhook,
  chart: BarChart3,
  pen: PenTool,
} as const satisfies Record<string, LucideIcon>;

export type SkillIconKey = keyof typeof SKILL_ICONS;

export const SKILL_ICON_OPTIONS: ReadonlyArray<{ key: SkillIconKey; label: string }> =
  [
    { key: "code", label: "Code" },
    { key: "braces", label: "Braces / TS" },
    { key: "terminal", label: "Terminal" },
    { key: "database", label: "Database" },
    { key: "globe", label: "Globe / web" },
    { key: "layers", label: "Layers / UI" },
    { key: "cpu", label: "CPU / logic" },
    { key: "cloud", label: "Cloud" },
    { key: "mobile", label: "Mobile" },
    { key: "palette", label: "Design" },
    { key: "package", label: "Package / deps" },
    { key: "git", label: "Git" },
    { key: "shield", label: "Security" },
    { key: "zap", label: "Performance" },
    { key: "layout", label: "Layout / workflow" },
    { key: "server", label: "Server" },
    { key: "webhook", label: "API / hooks" },
    { key: "chart", label: "Charts / data" },
    { key: "pen", label: "Writing / UX" },
  ];

export function normalizeSkillIconKey(raw: unknown): string {
  const s = typeof raw === "string" ? raw.trim() : "";
  return s in SKILL_ICONS ? s : "";
}

export function skillIconComponent(key: string): LucideIcon {
  if (key in SKILL_ICONS) return SKILL_ICONS[key as SkillIconKey];
  return Sparkles;
}
