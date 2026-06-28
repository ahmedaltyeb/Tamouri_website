import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// No ISR cache — serve fresh on every request so CMS changes appear immediately.
// The browser/CDN Cache-Control header still allows a short public cache.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        titleEn: true,
        titleAr: true,
        type: true,
        url: true,
        targetId: true,
        icon: true,
        image: true,
        badge: true,
        openInNewTab: true,
      },
    });
    return NextResponse.json(items, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
