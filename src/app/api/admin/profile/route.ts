import { NextResponse } from "next/server";
import {
  normalizeProfile,
  readPortfolio,
  writePortfolio,
} from "@/lib/portfolio-store";
import type { Profile } from "@/lib/types";

export async function PUT(request: Request) {
  let body: Partial<Profile>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = await readPortfolio();
  const prev = data.profile;
  data.profile = normalizeProfile({ ...prev, ...body }, prev);
  await writePortfolio(data);
  return NextResponse.json(data.profile);
}
