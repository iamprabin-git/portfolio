import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { readPortfolio, writePortfolio } from "@/lib/portfolio-store";
import { normalizeSkillIconKey } from "@/lib/skill-icons";
import type { Skill } from "@/lib/types";

function clampProficiency(n: unknown): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return 70;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function sanitizeSinceYear(n: unknown): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return 0;
  const y = Math.round(n);
  const max = new Date().getFullYear() + 1;
  if (y < 1970 || y > max) return 0;
  return y;
}

export async function POST(request: Request) {
  let body: Partial<Omit<Skill, "id">>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const skill: Skill = {
    id: randomUUID(),
    name: String(body.name ?? "").trim() || "Skill",
    category: String(body.category ?? "").trim() || "General",
    icon: normalizeSkillIconKey(body.icon),
    proficiency: clampProficiency(body.proficiency),
    sinceYear: sanitizeSinceYear(body.sinceYear),
  };

  const data = await readPortfolio();
  data.skills.push(skill);
  await writePortfolio(data);
  return NextResponse.json(skill, { status: 201 });
}
