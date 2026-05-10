import { SkillGlyph } from "@/components/skill-glyph";
import type { Skill } from "@/lib/types";

type Props = {
  skills: Skill[];
  /** Only show this many most-recent years (distinct years), newest first */
  compact?: boolean;
};

export function SkillsTimeline({ skills, compact }: Props) {
  const timed = skills.filter((s) => s.sinceYear > 0);

  const byYear = timed.reduce<Record<number, Skill[]>>((acc, s) => {
    if (!acc[s.sinceYear]) acc[s.sinceYear] = [];
    acc[s.sinceYear].push(s);
    return acc;
  }, {});

  let years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  if (compact && years.length > 5) {
    years = years.slice(0, 5);
  }

  return (
    <section
      aria-labelledby="skills-timeline-heading"
      className="rounded-2xl border border-border bg-card p-6 shadow-[inset_0_1px_0_color-mix(in_oklab,white_5%,transparent)] sm:p-8"
    >
      <h2
        id="skills-timeline-heading"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-primary"
      >
        Timeline
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        When each skill entered regular use — set “since year” in Admin → Skills.
      </p>

      {timed.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          No timeline entries yet. Add a start year to any skill to show it here.
        </p>
      ) : (
        <ol className="mt-8 flex flex-col">
          {years.map((year, index) => (
            <li key={year} className="flex gap-4 pb-10 last:pb-0">
              <div
                className="flex shrink-0 flex-col items-center pt-1"
                aria-hidden
              >
                <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_3px_color-mix(in_oklab,var(--card)_100%,transparent)] ring-1 ring-primary/25" />
                {index < years.length - 1 ? (
                  <span className="mt-2 min-h-[2.5rem] w-px grow bg-border" />
                ) : null}
              </div>
              <div>
                <time
                  dateTime={String(year)}
                  className="block text-sm font-semibold tabular-nums text-foreground"
                >
                  {year}
                </time>
                <ul className="mt-3 flex flex-col gap-2">
                  {byYear[year]
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((s) => (
                      <li key={s.id}>
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <SkillGlyph icon={s.icon} className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">
                            {s.name}
                          </span>
                          <span className="mx-1.5 text-border">·</span>
                          {s.category}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
