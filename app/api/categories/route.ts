import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // ISR: stale category list is fine for 60s

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      nameEn: true,
      nameAr: true,
      image: true,
      sortOrder: true,
    },
  });

  return NextResponse.json(categories);
}
