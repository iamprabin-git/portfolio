import { SkillsAdmin } from "./skills-admin";
import { readPortfolio } from "@/lib/portfolio-store";

export default async function AdminSkillsPage() {
  const { skills } = await readPortfolio();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Skills
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Skills are grouped by category on the public homepage.
      </p>
      <div className="mt-10">
        <SkillsAdmin initial={skills} />
      </div>
    </div>
  );
}
