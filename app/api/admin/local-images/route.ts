import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

const IMAGE_RE = /\.(png|jpe?g|webp|gif)$/i;

// Returns all local product images from two folders:
//   /public/products/         → curated catalog images
//   /public/uploads/products/ → admin-uploaded images
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = [
    { dir: path.join(process.cwd(), "public", "products"),         prefix: "/products/" },
    { dir: path.join(process.cwd(), "public", "uploads", "products"), prefix: "/uploads/products/" },
  ];

  const images: string[] = [];

  for (const { dir, prefix } of sources) {
    try {
      const files = await readdir(dir);
      files
        .filter((f) => IMAGE_RE.test(f))
        .sort()
        .forEach((f) => images.push(`${prefix}${f}`));
    } catch {
      // Directory doesn't exist yet — safe to skip
    }
  }

  return NextResponse.json({ images });
}
