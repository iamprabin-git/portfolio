import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { readPortfolio, writePortfolio } from "@/lib/portfolio-store";
import type { Lead } from "@/lib/types";

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_PHONE = 40;
const MAX_COMPANY = 160;
const MAX_MESSAGE = 4000;

function looksLikeEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

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

  const name = String(body.name ?? "").trim().slice(0, MAX_NAME);
  const email = String(body.email ?? "").trim().slice(0, MAX_EMAIL);
  const phone = String(body.phone ?? "").trim().slice(0, MAX_PHONE);
  const company = String(body.company ?? "").trim().slice(0, MAX_COMPANY);
  const message = String(body.message ?? "").trim().slice(0, MAX_MESSAGE);

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!looksLikeEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  if (message.length < 10 || message.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: "Message must be between 10 and 4000 characters." },
      { status: 400 },
    );
  }

  const data = await readPortfolio();
  const row: Lead = {
    id: randomUUID(),
    name,
    email,
    phone,
    company,
    message,
    source: "contact_form",
    status: "new",
    notes: "",
    conversationNotes: "",
    futurePlanNotes: "",
    nextFollowUpAt: "",
    reminderKind: "",
    lastContactedAt: "",
    submittedAt: new Date().toISOString(),
    dealValue: 0,
    priority: "medium",
    tags: [],
  };

  data.leads.push(row);
  await writePortfolio(data);

  return NextResponse.json(
    { ok: true, message: "Thanks — your message was received." },
    { status: 201 },
  );
}
