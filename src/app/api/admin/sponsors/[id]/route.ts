import { NextResponse } from "next/server";
import { readPortfolio, writePortfolio } from "@/lib/portfolio-store";
import type { Sponsor } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Params) {
  const { id } = await ctx.params;
  let patch: Partial<Sponsor>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = await readPortfolio();
  const idx = data.sponsors.findIndex((s) => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const prev = data.sponsors[idx];
  const next: Sponsor = {
    ...prev,
    ...(patch.name !== undefined && {
      name: String(patch.name).trim() || prev.name,
    }),
    ...(patch.logoUrl !== undefined && { logoUrl: String(patch.logoUrl) }),
    ...(patch.websiteUrl !== undefined && {
      websiteUrl: String(patch.websiteUrl),
    }),
  };

  data.sponsors[idx] = next;
  await writePortfolio(data);
  return NextResponse.json(next);
}

export async function DELETE(_request: Request, ctx: Params) {
  const { id } = await ctx.params;
  const data = await readPortfolio();
  const len = data.sponsors.length;
  data.sponsors = data.sponsors.filter((s) => s.id !== id);
  if (data.sponsors.length === len) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writePortfolio(data);
  return NextResponse.json({ ok: true });
}
