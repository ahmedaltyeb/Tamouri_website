import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { invalidateCmsCache } from "@/lib/site-settings";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(slides);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    image?: string;
    order?: number;
    titleEn?: string;
    titleAr?: string;
    subtitleEn?: string;
    subtitleAr?: string;
    ctaLabelEn?: string;
    ctaLabelAr?: string;
    ctaUrl?: string;
    active?: boolean;
  };

  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.image?.trim()) {
    return NextResponse.json({ error: "image is required" }, { status: 422 });
  }

  const count = await prisma.heroSlide.count();
  const slide = await prisma.heroSlide.create({
    data: {
      image: body.image.trim(),
      order: body.order ?? count,
      titleEn: body.titleEn?.trim() || null,
      titleAr: body.titleAr?.trim() || null,
      subtitleEn: body.subtitleEn?.trim() || null,
      subtitleAr: body.subtitleAr?.trim() || null,
      ctaLabelEn: body.ctaLabelEn?.trim() || null,
      ctaLabelAr: body.ctaLabelAr?.trim() || null,
      ctaUrl: body.ctaUrl?.trim() || null,
      active: body.active ?? true,
    },
  });

  invalidateCmsCache();
  return NextResponse.json(slide, { status: 201 });
}
