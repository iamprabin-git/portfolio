import { ProjectsAdmin } from "./projects-admin";
import { readPortfolio } from "@/lib/portfolio-store";

export default async function AdminProjectsPage() {
  const { projects } = await readPortfolio();
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Projects
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create and edit portfolio projects. Changes apply immediately on the
        public site.
      </p>
      <div className="mt-10">
        <ProjectsAdmin initial={projects} />
      </div>
    </div>
  );
}
