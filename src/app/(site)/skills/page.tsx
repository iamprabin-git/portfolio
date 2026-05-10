import type { Metadata } from "next";
import { SkillChip } from "@/components/skill-chip";
import { SkillsProficiencyGraph } from "@/components/skills-proficiency-graph";
import { SkillsTimeline } from "@/components/skills-timeline";
import { readPortfolio } from "@/lib/portfolio-store";

export const metadata: Metadata = {
  title: "Skills",
};

export default async function SkillsPage() {
  const { skills } = await readPortfolio();

  const skillsByCategory = skills.reduce<
    Record<string, typeof skills>
  >((acc, s) => {
    const k = s.category || "General";
    if (!acc[k]) acc[k] = [];
    acc[k].push(s);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Skills
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Tools & technologies
        </h1>
        <p className="mt-4 text-muted-foreground">
          Proficiency bars and a skill timeline are driven from Admin → Skills.
          Tags below stay grouped by category for a quick scan.
        </p>
      </header>

      <div className="mt-14 grid gap-10 lg:grid-cols-5 lg:gap-12">
        <div className="lg:col-span-3">
          <SkillsProficiencyGraph skills={skills} />
        </div>
        <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
          <SkillsTimeline skills={skills} />
        </div>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(skillsByCategory).map(([category, items]) => (
          <div
            key={category}
            className="rounded-2xl border border-border bg-card p-6 shadow-[inset_0_1px_0_color-mix(in_oklab,white_4%,transparent)]"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
              {category}
            </h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {items.map((s) => (
                <li key={s.id}>
                  <SkillChip skill={s} variant="bordered" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {skills.length === 0 ? (
        <p className="mt-16 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          No skills yet. Add them in the admin panel under Skills.
        </p>
      ) : null}
    </div>
  );
}
