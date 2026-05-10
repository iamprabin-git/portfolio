import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { clampRating, readPortfolio, writePortfolio } from "@/lib/portfolio-store";
import type { Review } from "@/lib/types";

const MAX_QUOTE = 2000;
const MAX_NAME = 120;
const MAX_ROLE = 120;
const MAX_COMPANY = 120;

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

  const quote = String(body.quote ?? "").trim();
  const authorName = String(body.authorName ?? "").trim();
  if (authorName.length < 1 || authorName.length > MAX_NAME) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (quote.length < 10 || quote.length > MAX_QUOTE) {
    return NextResponse.json(
      { error: "Review must be between 10 and 2000 characters." },
      { status: 400 },
    );
  }

  const role = String(body.role ?? "").trim().slice(0, MAX_ROLE);
  const company = String(body.company ?? "").trim().slice(0, MAX_COMPANY);
  const avatarUrl = String(body.avatarUrl ?? "").trim().slice(0, 2048);

  const review: Review = {
    id: randomUUID(),
    authorName,
    role,
    company,
    quote,
    avatarUrl,
    rating: clampRating(body.rating),
    status: "pending",
    submittedAt: new Date().toISOString(),
    source: "public",
  };

  const data = await readPortfolio();
  data.reviews.push(review);
  await writePortfolio(data);

  return NextResponse.json(
    { ok: true, message: "Submitted for moderation." },
    { status: 201 },
  );
}
