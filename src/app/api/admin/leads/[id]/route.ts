import { NextResponse } from "next/server";
import {
  readPortfolio,
  writePortfolio,
} from "@/lib/portfolio-store";
import type {
  Lead,
  LeadPriority,
  LeadReminderKind,
  LeadStatus,
} from "@/lib/types";

const STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
  "archived",
];

function isLeadStatus(s: unknown): s is LeadStatus {
  return typeof s === "string" && STATUSES.includes(s as LeadStatus);
}

function normalizePatchTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const t of raw) {
    if (typeof t !== "string") continue;
    const s = t.trim().slice(0, 32);
    if (s && out.length < 16) out.push(s);
  }
  return out;
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Params) {
  const { id } = await ctx.params;
  let patch: Record<string, unknown>;
  try {
    patch = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = await readPortfolio();
  const idx = data.leads.findIndex((l) => l.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const prev = data.leads[idx];

  let status: LeadStatus = prev.status;
  if (patch.status !== undefined) {
    if (!isLeadStatus(patch.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    status = patch.status;
  }

  const nextFollowUpAt =
    patch.nextFollowUpAt === null || patch.nextFollowUpAt === ""
      ? ""
      : typeof patch.nextFollowUpAt === "string"
        ? patch.nextFollowUpAt
        : prev.nextFollowUpAt;

  const lastContactedAt =
    patch.lastContactedAt === null || patch.lastContactedAt === ""
      ? ""
      : typeof patch.lastContactedAt === "string"
        ? patch.lastContactedAt
        : prev.lastContactedAt;

  let dealValue = prev.dealValue;
  if (patch.dealValue !== undefined) {
    if (typeof patch.dealValue === "number" && Number.isFinite(patch.dealValue)) {
      dealValue = Math.max(
        0,
        Math.min(Number.MAX_SAFE_INTEGER, Math.round(patch.dealValue)),
      );
    }
  }

  let priority: LeadPriority = prev.priority;
  if (
    patch.priority === "low" ||
    patch.priority === "medium" ||
    patch.priority === "high"
  ) {
    priority = patch.priority;
  }

  let tags = prev.tags;
  if (patch.tags !== undefined) {
    tags = normalizePatchTags(patch.tags);
  }

  let reminderKind: LeadReminderKind | "" = prev.reminderKind;
  if (patch.reminderKind !== undefined) {
    const rk = patch.reminderKind;
    if (
      rk !== null &&
      rk !== "" &&
      rk !== "call" &&
      rk !== "sms" &&
      rk !== "meeting"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid reminder kind — use call, sms, meeting, or an empty string.",
        },
        { status: 400 },
      );
    }
    reminderKind =
      rk === null || rk === "" ? "" : (rk as LeadReminderKind);
  }

  const conversationNotes =
    patch.conversationNotes !== undefined
      ? String(patch.conversationNotes).slice(0, 12000)
      : prev.conversationNotes;
  const futurePlanNotes =
    patch.futurePlanNotes !== undefined
      ? String(patch.futurePlanNotes).slice(0, 12000)
      : prev.futurePlanNotes;

  const next: Lead = {
    ...prev,
    status,
    notes:
      typeof patch.notes === "string" ? patch.notes.slice(0, 12000) : prev.notes,
    conversationNotes,
    futurePlanNotes,
    nextFollowUpAt,
    reminderKind,
    lastContactedAt,
    dealValue,
    priority,
    tags,
    ...(typeof patch.name === "string" && {
      name: patch.name.trim().slice(0, 120) || prev.name,
    }),
    ...(typeof patch.email === "string" && {
      email: patch.email.trim().slice(0, 254) || prev.email,
    }),
    ...(typeof patch.phone === "string" && { phone: patch.phone.trim().slice(0, 40) }),
    ...(typeof patch.company === "string" && {
      company: patch.company.trim().slice(0, 160),
    }),
    ...(typeof patch.message === "string" && {
      message: patch.message.trim().slice(0, 8000),
    }),
  };

  data.leads[idx] = next;
  await writePortfolio(data);
  return NextResponse.json(next);
}

export async function DELETE(_request: Request, ctx: Params) {
  const { id } = await ctx.params;
  const data = await readPortfolio();
  const len = data.leads.length;
  data.leads = data.leads.filter((l) => l.id !== id);
  if (data.leads.length === len) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writePortfolio(data);
  return NextResponse.json({ ok: true });
}
