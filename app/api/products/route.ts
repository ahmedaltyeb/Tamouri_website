import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    // Exclude old Arabic-named seed products (they have no categoryId)
    where: { categoryId: { not: null } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(products);
}
