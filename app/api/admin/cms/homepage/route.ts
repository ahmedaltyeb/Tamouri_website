import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sections = await prisma.homepageSection.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json(sections);
}

// PUT — upsert a single section by key
export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;
  const key = String(body.key ?? "").trim();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  const section = await prisma.homepageSection.upsert({
    where: { key },
    create: {
      key,
      badgeEn:    body.badgeEn    ? String(body.badgeEn)    : null,
      badgeAr:    body.badgeAr    ? String(body.badgeAr)    : null,
      titleEn:    body.titleEn    ? String(body.titleEn)    : null,
      titleAr:    body.titleAr    ? String(body.titleAr)    : null,
      subtitleEn: body.subtitleEn ? String(body.subtitleEn) : null,
      subtitleAr: body.subtitleAr ? String(body.subtitleAr) : null,
      active:     body.active !== false,
    },
    update: {
      badgeEn:    body.badgeEn    ? String(body.badgeEn)    : null,
      badgeAr:    body.badgeAr    ? String(body.badgeAr)    : null,
      titleEn:    body.titleEn    ? String(body.titleEn)    : null,
      titleAr:    body.titleAr    ? String(body.titleAr)    : null,
      subtitleEn: body.subtitleEn ? String(body.subtitleEn) : null,
      subtitleAr: body.subtitleAr ? String(body.subtitleAr) : null,
      active:     body.active !== false,
    },
  });

  revalidatePath("/");
  revalidatePath("/api/cms/homepage");
  return NextResponse.json(section);
}
