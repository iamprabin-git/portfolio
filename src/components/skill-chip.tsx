import type { Skill } from "@/lib/types";
import { SkillGlyph } from "@/components/skill-glyph";
import { cn } from "@/lib/utils";

type Props = {
  skill: Skill;
  /** Homepage pills vs skills page bordered chips */
  variant?: "muted" | "bordered";
};

export function SkillChip({ skill, variant = "muted" }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground",
        variant === "muted" && "bg-muted",
        variant === "bordered" &&
          "border border-[color-mix(in_oklab,var(--border)_80%,transparent)] bg-muted",
      )}
    >
      <SkillGlyph icon={skill.icon} className="h-3.5 w-3.5 opacity-90" />
      {skill.name}
    </span>
  );
}
