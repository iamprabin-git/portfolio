import { NextResponse } from "next/server";
import { readPortfolio, writePortfolio } from "@/lib/portfolio-store";
import type { Project } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Params) {
  const { id } = await ctx.params;
  let patch: Partial<Project>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = await readPortfolio();
  const idx = data.projects.findIndex((p) => p.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const prev = data.projects[idx];
  const next: Project = {
    ...prev,
    ...(patch.title !== undefined && {
      title: String(patch.title).trim() || prev.title,
    }),
    ...(patch.summary !== undefined && { summary: String(patch.summary) }),
    ...(patch.description !== undefined && {
      description: String(patch.description),
    }),
    ...(patch.imageUrl !== undefined && { imageUrl: String(patch.imageUrl) }),
    ...(patch.tags !== undefined && {
      tags: Array.isArray(patch.tags)
        ? patch.tags.map((t) => String(t).trim()).filter(Boolean)
        : prev.tags,
    }),
    ...(patch.demoUrl !== undefined && { demoUrl: String(patch.demoUrl) }),
    ...(patch.repoUrl !== undefined && { repoUrl: String(patch.repoUrl) }),
    ...(patch.featured !== undefined && { featured: Boolean(patch.featured) }),
  };

  data.projects[idx] = next;
  await writePortfolio(data);
  return NextResponse.json(next);
}

export async function DELETE(_request: Request, ctx: Params) {
  const { id } = await ctx.params;
  const data = await readPortfolio();
  const len = data.projects.length;
  data.projects = data.projects.filter((p) => p.id !== id);
  if (data.projects.length === len) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writePortfolio(data);
  return NextResponse.json({ ok: true });
}
