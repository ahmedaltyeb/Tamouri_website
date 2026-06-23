import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";

// BUG FIX #7: require admin session — this endpoint lists server file paths
async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

// GET /api/admin/local-images — returns static product images from /public/products/
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dir = path.join(process.cwd(), "public", "products");
  try {
    const files = await readdir(dir);
    const images = files
      .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
      .sort()
      .map((f) => `/products/${f}`);
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
