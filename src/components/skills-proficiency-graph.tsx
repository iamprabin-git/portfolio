import { SkillGlyph } from "@/components/skill-glyph";
import type { Skill } from "@/lib/types";

type Props = {
  skills: Skill[];
  /** Tighter spacing for homepage preview */
  compact?: boolean;
};

export function SkillsProficiencyGraph({ skills, compact }: Props) {
  if (skills.length === 0) return null;

  const byCat = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    const k = s.category || "General";
    if (!acc[k]) acc[k] = [];
    acc[k].push(s);
    return acc;
  }, {});

  for (const k of Object.keys(byCat)) {
    byCat[k].sort((a, b) => b.proficiency - a.proficiency);
  }

  const categories = Object.keys(byCat).sort((a, b) => a.localeCompare(b));

  const gap = compact ? "gap-5" : "gap-8";
  const barH = compact ? "h-2" : "h-2.5";

  return (
    <section
      aria-labelledby="skills-proficiency-heading"
      className="rounded-2xl border border-border bg-card p-6 shadow-[inset_0_1px_0_color-mix(in_oklab,white_5%,transparent)] sm:p-8"
    >
      <h2
        id="skills-proficiency-heading"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-primary"
      >
        Proficiency
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Self-assessed comfort level — edit percentages in Admin → Skills.
      </p>

      <div className={`mt-8 flex flex-col ${gap}`}>
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-foreground">{category}</h3>
            <ul
              className={`mt-4 flex flex-col ${compact ? "gap-3.5" : "gap-4"}`}
              role="list"
            >
              {byCat[category].map((s) => (
                <li key={s.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
                      <SkillGlyph
                        icon={s.icon}
                        className="h-4 w-4 shrink-0 opacity-90"
                      />
                      <span className="truncate">{s.name}</span>
                    </span>
                    <span className="tabular-nums text-xs font-semibold text-muted-foreground">
                      {s.proficiency}%
                    </span>
                  </div>
                  <div
                    className={`mt-1.5 overflow-hidden rounded-full bg-muted ${barH}`}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={s.proficiency}
                    aria-valuetext={`${s.proficiency}%`}
                    aria-label={`${s.name} proficiency ${s.proficiency}%`}
                  >
                    <div
                      className={`${barH} rounded-full bg-gradient-to-r from-primary to-[color-mix(in_oklab,var(--primary)_65%,var(--accent))] transition-[width] duration-500 ease-out`}
                      style={{ width: `${s.proficiency}%` }}
                      aria-hidden
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
