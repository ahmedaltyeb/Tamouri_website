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

  const row = await prisma.storeSettings.findFirst();
  return NextResponse.json(row ?? {});
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const allowed = [
    "name", "nameEn", "nameAr", "taglineEn", "taglineAr",
    "logo", "favicon", "description", "location",
    "addressEn", "addressAr", "phone", "whatsapp", "email",
    "workingHours", "currency", "websiteUrl",
    "instagramUrl", "twitterUrl", "whatsappUrl",
    "seoTitleEn", "seoTitleAr", "seoDescEn", "seoDescAr", "ogImage",
  ];

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key] ?? null;
  }

  const existing = await prisma.storeSettings.findFirst();

  const row = existing
    ? await prisma.storeSettings.update({ where: { id: existing.id }, data })
    : await prisma.storeSettings.create({
        data: { name: String(data.nameEn ?? "Store"), ...data },
      });

  invalidateCmsCache();
  return NextResponse.json(row);
}
