import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  clampRating,
  readPortfolio,
  writePortfolio,
} from "@/lib/portfolio-store";
import type { Review } from "@/lib/types";

export async function POST(request: Request) {
  let body: Omit<Review, "id" | "status" | "submittedAt" | "source">;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const review: Review = {
    id: randomUUID(),
    authorName: String(body.authorName ?? "").trim() || "Anonymous",
    role: String(body.role ?? ""),
    company: String(body.company ?? ""),
    quote: String(body.quote ?? ""),
    avatarUrl: String(body.avatarUrl ?? ""),
    rating: clampRating(body.rating),
    status: "approved",
    submittedAt: new Date().toISOString(),
    source: "admin",
  };

  const data = await readPortfolio();
  data.reviews.push(review);
  await writePortfolio(data);
  return NextResponse.json(review, { status: 201 });
}
