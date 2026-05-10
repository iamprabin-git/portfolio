import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import {
  verifyAdminPasswordHash,
} from "@/lib/admin-password";
import { createSessionToken } from "@/lib/auth";
import { readPortfolio } from "@/lib/portfolio-store";

const COOKIE = "portfolio_session";

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

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = body.password ?? "";
  const data = await readPortfolio();
  const storedHash = data.adminPasswordHash?.trim();

  let valid = false;
  if (storedHash) {
    valid = verifyAdminPasswordHash(storedHash, password);
  } else {
    const expected = process.env.ADMIN_PASSWORD ?? "";
    if (!expected) {
      return NextResponse.json(
        {
          error:
            "No admin password is configured. Set ADMIN_PASSWORD or save one in Admin → Settings.",
        },
        { status: 500 },
      );
    }
    valid = safeCompare(password, expected);
  }

  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  let token: string;
  try {
    token = await createSessionToken();
  } catch {
    return NextResponse.json(
      { error: "AUTH_SECRET must be set (min 16 characters)." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
