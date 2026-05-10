import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE = "portfolio_session";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    return new Uint8Array();
  }
  return new TextEncoder().encode(s);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === "/admin/login") {
    return NextResponse.next();
  }
  if (path === "/api/admin/login") {
    return NextResponse.next();
  }

  const enc = secret();
  if (enc.length === 0) {
    if (path.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "Server misconfigured: AUTH_SECRET missing" },
        { status: 500 },
      );
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const token = request.cookies.get(COOKIE)?.value;
  if (!token) {
    if (path.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await jwtVerify(token, enc);
    return NextResponse.next();
  } catch {
    if (path.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    res.cookies.delete(COOKIE);
    return res;
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
