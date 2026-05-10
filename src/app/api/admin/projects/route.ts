import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { readPortfolio, writePortfolio } from "@/lib/portfolio-store";
import type { Project } from "@/lib/types";

export async function POST(request: Request) {
  let body: Omit<Project, "id">;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const project: Project = {
    id: randomUUID(),
    title: String(body.title ?? "").trim() || "Untitled",
    summary: String(body.summary ?? ""),
    description: String(body.description ?? ""),
    imageUrl: String(body.imageUrl ?? ""),
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean)
      : [],
    demoUrl: String(body.demoUrl ?? ""),
    repoUrl: String(body.repoUrl ?? ""),
    featured: Boolean(body.featured),
  };

  const data = await readPortfolio();
  data.projects.push(project);
  await writePortfolio(data);
  return NextResponse.json(project, { status: 201 });
}
