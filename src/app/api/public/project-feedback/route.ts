import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { clampRating, readPortfolio, writePortfolio } from "@/lib/portfolio-store";
import type { ProjectFeedback } from "@/lib/types";

const MAX_COMMENT = 2000;
const MAX_NAME = 120;
const MAX_EMAIL = 200;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const trap =
    typeof body.trapWebsite === "string" ? body.trapWebsite.trim() : "";
  if (trap.length > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const projectId = String(body.projectId ?? "").trim();
  const comment = String(body.comment ?? "").trim();
  const authorName = String(body.authorName ?? "").trim();

  const data = await readPortfolio();
  const project = data.projects.some((p) => p.id === projectId);
  if (!project || !projectId) {
    return NextResponse.json({ error: "Unknown project." }, { status: 404 });
  }

  if (authorName.length < 1 || authorName.length > MAX_NAME) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (comment.length < 5 || comment.length > MAX_COMMENT) {
    return NextResponse.json(
      { error: "Comment must be between 5 and 2000 characters." },
      { status: 400 },
    );
  }

  const email = String(body.email ?? "").trim().slice(0, MAX_EMAIL);

  const row: ProjectFeedback = {
    id: randomUUID(),
    projectId,
    authorName,
    email,
    comment,
    rating: clampRating(body.rating),
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  data.projectFeedback.push(row);
  await writePortfolio(data);

  return NextResponse.json(
    { ok: true, message: "Submitted for moderation." },
    { status: 201 },
  );
}
