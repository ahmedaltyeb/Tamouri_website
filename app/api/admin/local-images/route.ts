import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

// Returns a list of all static product images stored in /public/products/
export async function GET() {
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
