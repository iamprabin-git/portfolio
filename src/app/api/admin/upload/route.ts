import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const entry = formData.get("file");
  if (!entry || !(entry instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (entry.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 5 MB)" },
      { status: 400 },
    );
  }

  const mime = entry.type;
  const ext = MIME_EXT[mime];
  if (!ext) {
    return NextResponse.json(
      {
        error:
          "Unsupported type. Use JPEG, PNG, GIF, WebP, or SVG.",
      },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await entry.arrayBuffer());
  const base = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, base), buf);

  return NextResponse.json({ url: `/uploads/${base}` });
}
