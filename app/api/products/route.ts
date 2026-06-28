import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  return NextResponse.json(products);
}
