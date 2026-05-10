import { ProjectFeedbackAdmin } from "./project-feedback-admin";
import { readPortfolio } from "@/lib/portfolio-store";

export default async function AdminProjectFeedbackPage() {
  const { projects, projectFeedback } = await readPortfolio();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Project feedback
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Comments and ratings submitted from public project pages. Approve to
        display them on each project.
      </p>
      <div className="mt-10">
        <ProjectFeedbackAdmin
          projects={projects.map((p) => ({ id: p.id, title: p.title }))}
          initialFeedback={projectFeedback}
        />
      </div>
    </div>
  );
}
