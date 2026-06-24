import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

// ── Config ────────────────────────────────────────────────────────────────────

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
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
  const ts = Date.now();
  const rand = randomBytes(5).toString("hex");
  return `${ts}-${rand}${ext}`;
}

// ── POST /api/admin/upload ────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure the upload directory exists (safe on all platforms)
  await mkdir(UPLOAD_DIR, { recursive: true });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse upload request" }, { status: 400 });
  }

  // Accept both field names: "files" (multiple) and "file" (single)
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

  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of rawFiles) {
    // ── Validate MIME type ──
    if (!ALLOWED_TYPES.has(file.type)) {
      errors.push(`"${file.name}": only JPG, PNG, and WebP are allowed`);
      continue;
    }

    // ── Validate size ──
    if (file.size > MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      errors.push(`"${file.name}": ${mb} MB exceeds the 5 MB limit`);
      continue;
    }

    // ── Write file ──
    const filename = safeFilename(file.type);
    const filePath = path.join(UPLOAD_DIR, filename);

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      urls.push(`/uploads/products/${filename}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Write error";
      errors.push(`"${file.name}": ${msg}`);
    }
  }

  // All files failed
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
