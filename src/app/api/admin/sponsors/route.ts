import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { readPortfolio, writePortfolio } from "@/lib/portfolio-store";
import type { Sponsor } from "@/lib/types";

export async function POST(request: Request) {
  let body: Omit<Sponsor, "id">;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sponsor: Sponsor = {
    id: randomUUID(),
    name: String(body.name ?? "").trim() || "Sponsor",
    logoUrl: String(body.logoUrl ?? ""),
    websiteUrl: String(body.websiteUrl ?? ""),
  };

  const data = await readPortfolio();
  data.sponsors.push(sponsor);
  await writePortfolio(data);
  return NextResponse.json(sponsor, { status: 201 });
}
