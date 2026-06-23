import { NextResponse } from "next/server";
import { auth } from "@/auth";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return NextResponse.json(
      {
        error:
          "Image upload is not configured. " +
          "Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET to your environment variables.",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, and WebP images are allowed" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be under 5 MB" },
      { status: 400 },
    );
  }

  // Upload directly to Cloudinary using unsigned preset (no SDK required)
  const cd = new FormData();
  cd.append("file", file);
  cd.append("upload_preset", UPLOAD_PRESET);
  cd.append("folder", "tamouri/products");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: cd },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("[upload] Cloudinary error:", text);
    return NextResponse.json({ error: "Upload failed — check Cloudinary credentials" }, { status: 502 });
  }

  const data = (await res.json()) as { secure_url: string };
  return NextResponse.json({ url: data.secure_url });
}
