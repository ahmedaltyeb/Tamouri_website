import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Revalidate Next.js's server-side fetch cache every 60 seconds (ISR for API routes)
export const revalidate = 60;

export async function GET() {
  const products = await prisma.product.findMany({
    // Show products that have either a categoryId (manual/seeded) or a
    // categorySlug (imported via bulk import). Excludes legacy seed products
    // that have neither.
    where: {
      OR: [
        { categoryId: { not: null } },
        { categorySlug: { not: "" } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(products, {
    headers: {
      // CDN (Vercel Edge) serves stale for up to 60 s, revalidates in background.
      // Browsers cache for 30 s to keep product data reasonably fresh.
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
