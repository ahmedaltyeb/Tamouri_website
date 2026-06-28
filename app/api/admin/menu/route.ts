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
  const items = await prisma.menuItem.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    titleEn?: string;
    titleAr?: string;
    type?: string;
    url?: string;
    targetId?: string;
    icon?: string;
    image?: string;
    badge?: string;
    sortOrder?: number;
    active?: boolean;
    openInNewTab?: boolean;
  };

  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.titleEn?.trim()) {
    return NextResponse.json({ error: "titleEn is required" }, { status: 422 });
  }
  if (!body.titleAr?.trim()) {
    return NextResponse.json({ error: "titleAr is required" }, { status: 422 });
  }
  const validTypes = ["url", "category", "page", "external"];
  if (!body.type || !validTypes.includes(body.type)) {
    return NextResponse.json({ error: "type must be url | category | page | external" }, { status: 422 });
  }

  const count = await prisma.menuItem.count();
  const item = await prisma.menuItem.create({
    data: {
      titleEn:     body.titleEn.trim(),
      titleAr:     body.titleAr.trim(),
      type:        body.type,
      url:         body.url?.trim() || null,
      targetId:    body.targetId?.trim() || null,
      icon:        body.icon?.trim() || null,
      image:       body.image?.trim() || null,
      badge:       body.badge?.trim() || null,
      sortOrder:   body.sortOrder ?? count,
      active:      body.active ?? true,
      openInNewTab: body.openInNewTab ?? false,
    },
  });

  invalidateCmsCache();
  return NextResponse.json(item, { status: 201 });
}
