import Link from "next/link";
import type { Project } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card
      className={cn(
        "card-sparkle-hover group gap-0 overflow-hidden rounded-2xl py-0 shadow-sm transition",
        "hover:border-primary/40 hover:shadow-md",
      )}
    >
      <Link
        href={`/projects/${project.id}`}
        className="block rounded-t-xl outline-none ring-ring focus-visible:ring-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {project.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.imageUrl}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
          {project.featured ? (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
              Featured
            </span>
          ) : null}
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 pb-4 pt-5">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground group-hover:text-primary">
              {project.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {project.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex flex-wrap items-center gap-3 border-t border-border bg-muted/30 px-5 py-4">
        <Link
          href={`/projects/${project.id}`}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Details & feedback
        </Link>
        {project.demoUrl ? (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Live demo
          </a>
        ) : null}
        {project.repoUrl ? (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Source
          </a>
        ) : null}
      </CardFooter>
    </Card>
  );
}
