import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

// ── Config ────────────────────────────────────────────────────────────────────

const ALLOWED_DIRS = new Set(["products", "hero", "payments", "pages"]);
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png":  ".png",
  "image/webp": ".webp",
};
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 20;

// ── Auth ──────────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

// ── Filename helper ───────────────────────────────────────────────────────────

function safeFilename(mimeType: string): string {
  const ext = EXT_MAP[mimeType] ?? ".jpg";
  const ts  = Date.now();
  const rand = randomBytes(5).toString("hex");
  return `${ts}-${rand}${ext}`;
}

// ── POST /api/admin/upload ────────────────────────────────────────────────────
//
// Storage strategy:
//   • On Vercel (BLOB_READ_WRITE_TOKEN is set): upload to Vercel Blob CDN.
//     Returns a permanent https://...vercel-storage.com/... URL.
//   • In local dev (no token): write to public/uploads/{dir}/.
//     Returns a /uploads/{dir}/filename path served by Next.js.

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dirParam = searchParams.get("dir") ?? "products";
  const subDir   = ALLOWED_DIRS.has(dirParam) ? dirParam : "products";

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse upload request" }, { status: 400 });
  }

  const rawFiles = [
    ...formData.getAll("files"),
    ...formData.getAll("file"),
  ].filter((f): f is File => f instanceof File && f.size > 0);

  if (rawFiles.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }
  if (rawFiles.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_FILES} images per upload batch` },
      { status: 400 },
    );
  }

  const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  const urls:   string[] = [];
  const errors: string[] = [];

  for (const file of rawFiles) {
    if (!ALLOWED_TYPES.has(file.type)) {
      errors.push(`"${file.name}": only JPG, PNG, and WebP are allowed`);
      continue;
    }
    if (file.size > MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      errors.push(`"${file.name}": ${mb} MB exceeds the 5 MB limit`);
      continue;
    }

    const filename = safeFilename(file.type);

    try {
      if (useBlob) {
        // ── Vercel Blob (production) ────────────────────────────────────────
        const blob = await put(`uploads/${subDir}/${filename}`, file, {
          access: "public",
          contentType: file.type,
        });
        urls.push(blob.url);
      } else {
        // ── Local filesystem (dev only) ────────────────────────────────────
        const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", subDir);
        await mkdir(UPLOAD_DIR, { recursive: true });
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(path.join(UPLOAD_DIR, filename), buffer);
        urls.push(`/uploads/${subDir}/${filename}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Write error";
      errors.push(`"${file.name}": ${msg}`);
    }
  }

  if (urls.length === 0) {
    return NextResponse.json(
      { error: errors[0] ?? "No valid files were uploaded", errors },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    urls,
    ...(errors.length ? { warnings: errors } : {}),
  });
}
