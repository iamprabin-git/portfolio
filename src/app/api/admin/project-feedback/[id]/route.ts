import { NextResponse } from "next/server";
import { readPortfolio, writePortfolio } from "@/lib/portfolio-store";
import type { ProjectFeedbackStatus } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Params) {
  const { id } = await ctx.params;
  let body: { status?: ProjectFeedbackStatus };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = body.status;
  if (
    status !== "pending" &&
    status !== "approved" &&
    status !== "rejected"
  ) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const data = await readPortfolio();
  const idx = data.projectFeedback.findIndex((f) => f.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  data.projectFeedback[idx] = {
    ...data.projectFeedback[idx],
    status,
  };
  await writePortfolio(data);
  return NextResponse.json(data.projectFeedback[idx]);
}

export async function DELETE(_request: Request, ctx: Params) {
  const { id } = await ctx.params;
  const data = await readPortfolio();
  const len = data.projectFeedback.length;
  data.projectFeedback = data.projectFeedback.filter((f) => f.id !== id);
  if (data.projectFeedback.length === len) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writePortfolio(data);
  return NextResponse.json({ ok: true });
}
