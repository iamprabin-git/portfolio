import { NextResponse } from "next/server";
import {
  clampRating,
  readPortfolio,
  writePortfolio,
} from "@/lib/portfolio-store";
import type { Review, ReviewModerationStatus } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Params) {
  const { id } = await ctx.params;
  let patch: Partial<Review>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = await readPortfolio();
  const idx = data.reviews.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const prev = data.reviews[idx];

  let status: ReviewModerationStatus = prev.status;
  if (patch.status !== undefined) {
    const s = patch.status;
    if (s === "pending" || s === "approved" || s === "rejected") {
      status = s;
    }
  }

  const next: Review = {
    ...prev,
    status,
    ...(patch.authorName !== undefined && {
      authorName: String(patch.authorName).trim() || prev.authorName,
    }),
    ...(patch.role !== undefined && { role: String(patch.role) }),
    ...(patch.company !== undefined && { company: String(patch.company) }),
    ...(patch.quote !== undefined && { quote: String(patch.quote) }),
    ...(patch.avatarUrl !== undefined && { avatarUrl: String(patch.avatarUrl) }),
    ...(patch.rating !== undefined && {
      rating: clampRating(patch.rating),
    }),
    ...(patch.source !== undefined &&
    (patch.source === "public" || patch.source === "admin")
      ? { source: patch.source }
      : {}),
    ...(typeof patch.submittedAt === "string"
      ? { submittedAt: patch.submittedAt }
      : {}),
  };

  data.reviews[idx] = next;
  await writePortfolio(data);
  return NextResponse.json(next);
}

export async function DELETE(_request: Request, ctx: Params) {
  const { id } = await ctx.params;
  const data = await readPortfolio();
  const len = data.reviews.length;
  data.reviews = data.reviews.filter((r) => r.id !== id);
  if (data.reviews.length === len) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writePortfolio(data);
  return NextResponse.json({ ok: true });
}
