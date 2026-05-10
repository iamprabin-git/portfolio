import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { readPortfolio, writePortfolio } from "@/lib/portfolio-store";
import type { Lead, LeadPriority } from "@/lib/types";

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_PHONE = 40;
const MAX_COMPANY = 160;
const MAX_MESSAGE = 8000;

function looksLikeEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function clampDealValue(n: unknown): number {
  if (typeof n !== "number" || !Number.isFinite(n)) return 0;
  return Math.max(
    0,
    Math.min(Number.MAX_SAFE_INTEGER, Math.round(n)),
  );
}

function optionalPriority(raw: unknown): LeadPriority {
  return raw === "low" || raw === "medium" || raw === "high"
    ? raw
    : "medium";
}

function tagsFromBody(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    const out: string[] = [];
    for (const t of raw) {
      if (typeof t !== "string") continue;
      const s = t.trim().slice(0, 32);
      if (s && out.length < 16) out.push(s);
    }
    return out;
  }
  const csv = typeof raw === "string" ? raw.trim() : "";
  if (!csv) return [];
  return csv
    .split(",")
    .map((s) => s.trim().slice(0, 32))
    .filter(Boolean)
    .slice(0, 16);
}

/** Manual lead entry from admin */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, MAX_NAME);
  const email = String(body.email ?? "").trim().slice(0, MAX_EMAIL);
  const phone = String(body.phone ?? "").trim().slice(0, MAX_PHONE);
  const company = String(body.company ?? "").trim().slice(0, MAX_COMPANY);
  const message = String(body.message ?? "").trim().slice(0, MAX_MESSAGE);
  const dealValue = clampDealValue(body.dealValue);
  const priority = optionalPriority(body.priority);
  const tags = tagsFromBody(body.tags ?? body.tagsCsv);

  if (name.length < 1) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!looksLikeEmail(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  const data = await readPortfolio();
  const row: Lead = {
    id: randomUUID(),
    name,
    email,
    phone,
    company,
    message,
    source: "manual",
    status: "new",
    notes: "",
    conversationNotes: "",
    futurePlanNotes: "",
    nextFollowUpAt: "",
    reminderKind: "",
    lastContactedAt: "",
    submittedAt: new Date().toISOString(),
    dealValue,
    priority,
    tags,
  };

  data.leads.push(row);
  await writePortfolio(data);

  return NextResponse.json(row, { status: 201 });
}
