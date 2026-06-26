import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json() as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if ("icon"          in body) data.icon          = String(body.icon ?? "box");
  if ("titleEn"       in body) data.titleEn       = String(body.titleEn ?? "");
  if ("titleAr"       in body) data.titleAr       = String(body.titleAr ?? "");
  if ("descriptionEn" in body) data.descriptionEn = String(body.descriptionEn ?? "");
  if ("descriptionAr" in body) data.descriptionAr = String(body.descriptionAr ?? "");
  if ("color"         in body) data.color         = String(body.color ?? "bg-blue-50 text-blue-600 border-blue-100");
  if ("sortOrder"     in body) data.sortOrder     = typeof body.sortOrder === "number" ? body.sortOrder : 0;
  if ("active"        in body) data.active        = Boolean(body.active);

  const card = await prisma.featureCard.update({ where: { id }, data });
  return NextResponse.json(card);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.featureCard.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
