import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

const SELECT = {
  id: true,
  name: true,
  slug: true,
  nameEn: true,
  nameAr: true,
  image: true,
  sortOrder: true,
  featured: true,
} as const;

const ORDER = [{ sortOrder: "asc" as const }, { name: "asc" as const }];

// CDN caches for 60 s; browsers get 30 s to keep category lists fresh.
const CACHE = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const homepage = searchParams.get("homepage") === "true";

  if (homepage) {
    // Try featured categories first; fall back to first 6 active by sortOrder.
    const featured = await prisma.category.findMany({
      where: { active: true, featured: true },
      orderBy: ORDER,
      select: SELECT,
    });

    if (featured.length > 0) {
      return NextResponse.json({ categories: featured, total: null }, { headers: CACHE });
    }

    const fallback = await prisma.category.findMany({
      where: { active: true },
      orderBy: ORDER,
      take: 6,
      select: SELECT,
    });
    const total = await prisma.category.count({ where: { active: true } });

    return NextResponse.json({ categories: fallback, total }, { headers: CACHE });
  }

  // Shop page / default: all active categories.
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: ORDER,
    select: SELECT,
  });

  return NextResponse.json(categories, { headers: CACHE });
}
