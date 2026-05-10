import { createElement } from "react";
import { skillIconComponent } from "@/lib/skill-icons";
import { cn } from "@/lib/utils";

type Props = {
  /** Stored `Skill.icon` key; unknown values use a neutral sparkle icon. */
  icon: string;
  className?: string;
};

export function SkillGlyph({ icon, className }: Props) {
  const Cmp = skillIconComponent(icon);
  return createElement(Cmp, {
    className: cn("shrink-0 text-primary", className),
    "aria-hidden": true,
  });
}
