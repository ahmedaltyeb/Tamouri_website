import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cards = await prisma.featureCard.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;

  const titleEn = String(body.titleEn ?? "").trim();
  const titleAr = String(body.titleAr ?? "").trim();
  const descriptionEn = String(body.descriptionEn ?? "").trim();
  const descriptionAr = String(body.descriptionAr ?? "").trim();
  if (!titleEn || !titleAr || !descriptionEn || !descriptionAr) {
    return NextResponse.json({ error: "All title and description fields required" }, { status: 400 });
  }

  const card = await prisma.featureCard.create({
    data: {
      icon:          String(body.icon ?? "box"),
      titleEn,       titleAr,
      descriptionEn, descriptionAr,
      color:     body.color     ? String(body.color)     : "bg-blue-50 text-blue-600 border-blue-100",
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      active:    body.active !== false,
    },
  });
  return NextResponse.json(card, { status: 201 });
}
