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

  const sections = await prisma.footerSection.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(sections);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    titleEn?: string;
    titleAr?: string;
    links?: unknown[];
    order?: number;
    active?: boolean;
  };

  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.titleEn?.trim()) {
    return NextResponse.json({ error: "titleEn is required" }, { status: 422 });
  }

  const count = await prisma.footerSection.count();
  const section = await prisma.footerSection.create({
    data: {
      titleEn: body.titleEn.trim(),
      titleAr: body.titleAr?.trim() || body.titleEn.trim(),
      links: JSON.stringify(Array.isArray(body.links) ? body.links : []),
      order: body.order ?? count,
      active: body.active ?? true,
    },
  });

  invalidateCmsCache();
  return NextResponse.json(section, { status: 201 });
}
