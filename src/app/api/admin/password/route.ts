import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import {
  adminPasswordMeetsPolicy,
  hashAdminPassword,
  verifyAdminPasswordHash,
} from "@/lib/admin-password";
import { ADMIN_PASSWORD_MIN_LENGTH } from "@/lib/admin-password-policy";
import { readPortfolio, writePortfolio } from "@/lib/portfolio-store";

function safeCompare(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export async function PUT(request: Request) {
  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const currentPassword = body.currentPassword ?? "";
  const newPassword = body.newPassword ?? "";

  if (!adminPasswordMeetsPolicy(newPassword)) {
    return NextResponse.json(
      {
        error: `New password must be at least ${ADMIN_PASSWORD_MIN_LENGTH} characters.`,
      },
      { status: 400 },
    );
  }

  const data = await readPortfolio();
  const storedHash = data.adminPasswordHash?.trim();

  let validCurrent = false;
  if (storedHash) {
    validCurrent = verifyAdminPasswordHash(storedHash, currentPassword);
  } else {
    const expected = process.env.ADMIN_PASSWORD ?? "";
    validCurrent =
      expected.length > 0 && safeCompare(currentPassword, expected);
  }

  if (!validCurrent) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 },
    );
  }

  data.adminPasswordHash = hashAdminPassword(newPassword);
  await writePortfolio(data);
  return NextResponse.json({ ok: true });
}
