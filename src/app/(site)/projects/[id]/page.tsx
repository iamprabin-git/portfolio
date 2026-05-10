import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectFeedbackPanel } from "@/components/project-feedback-panel";
import {
  approvedFeedbackForProject,
  readPortfolio,
} from "@/lib/portfolio-store";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { projects } = await readPortfolio();
  const project = projects.find((p) => p.id === id);
  return {
    title: project?.title ?? "Project",
    description: project?.summary,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await readPortfolio();
  const project = data.projects.find((p) => p.id === id);
  if (!project) notFound();

  const approvedFeedback = approvedFeedbackForProject(
    data.projectFeedback,
    project.id,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/projects"
        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        ← All projects
      </Link>

      <article className="mt-8">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="relative aspect-[21/9] bg-muted sm:aspect-[2.4/1]">
            {project.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
            {project.featured ? (
              <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                Featured
              </span>
            ) : null}
          </div>
          <div className="p-6 sm:p-10">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {project.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{project.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            {project.description ? (
              <div className="mt-8 whitespace-pre-wrap text-foreground leading-relaxed">
                {project.description}
              </div>
            ) : null}
            <div className="mt-10 flex flex-wrap gap-4">
              {project.demoUrl ? (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110"
                >
                  Live demo
                </a>
              ) : null}
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:border-[color-mix(in_oklab,var(--accent)_40%,var(--border))]"
                >
                  Source code
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <ProjectFeedbackPanel
          projectId={project.id}
          initialApproved={approvedFeedback}
        />
      </article>
    </div>
  );
}
