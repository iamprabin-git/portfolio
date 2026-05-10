import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { readPortfolio } from "@/lib/portfolio-store";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function ProjectsPage() {
  const { projects } = await readPortfolio();
  const sorted = [...projects].sort(
    (a, b) => Number(b.featured) - Number(a.featured),
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Projects
        </h1>
        <p className="mt-3 text-muted-foreground">
          Case studies, products, and experiments. Content is loaded from your
          portfolio data file and edited in the admin panel.
        </p>
      </header>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {sorted.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
      {sorted.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
          No projects yet. Sign in to the admin panel to add your first
          project.
        </p>
      ) : null}
    </div>
  );
}
