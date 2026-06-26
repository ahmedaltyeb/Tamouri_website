import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;

  const slug    = String(body.slug    ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  const titleEn = String(body.titleEn ?? "").trim();
  const titleAr = String(body.titleAr ?? "").trim();
  if (!slug || !titleEn || !titleAr) {
    return NextResponse.json({ error: "slug, titleEn, titleAr required" }, { status: 400 });
  }

  const page = await prisma.page.create({
    data: {
      slug, titleEn, titleAr,
      contentEn:    String(body.contentEn    ?? ""),
      contentAr:    String(body.contentAr    ?? ""),
      seoTitleEn:   body.seoTitleEn   ? String(body.seoTitleEn)   : null,
      seoTitleAr:   body.seoTitleAr   ? String(body.seoTitleAr)   : null,
      seoDescEn:    body.seoDescEn    ? String(body.seoDescEn)    : null,
      seoDescAr:    body.seoDescAr    ? String(body.seoDescAr)    : null,
      published:    body.published !== false,
    },
  });
  return NextResponse.json(page, { status: 201 });
}
