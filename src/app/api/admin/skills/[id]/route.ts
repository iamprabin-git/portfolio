import { NextResponse } from "next/server";
import { readPortfolio, writePortfolio } from "@/lib/portfolio-store";
import { normalizeSkillIconKey } from "@/lib/skill-icons";
import type { Skill } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

function clampProficiency(n: unknown): number | undefined {
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function sanitizeSinceYear(n: unknown): number | undefined {
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  const y = Math.round(n);
  const max = new Date().getFullYear() + 1;
  if (y < 1970 || y > max) return 0;
  return y;
}

export async function PATCH(request: Request, ctx: Params) {
  const { id } = await ctx.params;
  let patch: Partial<Skill>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = await readPortfolio();
  const idx = data.skills.findIndex((s) => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const prev = data.skills[idx];
  const nextProf = clampProficiency(patch.proficiency);
  const nextYear = sanitizeSinceYear(patch.sinceYear);

  const next: Skill = {
    ...prev,
    ...(patch.name !== undefined && {
      name: String(patch.name).trim() || prev.name,
    }),
    ...(patch.category !== undefined && {
      category: String(patch.category).trim() || prev.category,
    }),
    ...(patch.icon !== undefined
      ? { icon: normalizeSkillIconKey(patch.icon) }
      : {}),
    ...(nextProf !== undefined ? { proficiency: nextProf } : {}),
    ...(patch.sinceYear !== undefined
      ? { sinceYear: nextYear ?? 0 }
      : {}),
  };

  data.skills[idx] = next;
  await writePortfolio(data);
  return NextResponse.json(next);
}

export async function DELETE(_request: Request, ctx: Params) {
  const { id } = await ctx.params;
  const data = await readPortfolio();
  const len = data.skills.length;
  data.skills = data.skills.filter((s) => s.id !== id);
  if (data.skills.length === len) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writePortfolio(data);
  return NextResponse.json({ ok: true });
}
