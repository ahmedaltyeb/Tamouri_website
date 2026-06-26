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
  if ("nameEn"     in body) data.nameEn     = String(body.nameEn     ?? "");
  if ("nameAr"     in body) data.nameAr     = String(body.nameAr     ?? "");
  if ("reviewEn"   in body) data.reviewEn   = String(body.reviewEn   ?? "");
  if ("reviewAr"   in body) data.reviewAr   = String(body.reviewAr   ?? "");
  if ("locationEn" in body) data.locationEn = body.locationEn ? String(body.locationEn) : null;
  if ("locationAr" in body) data.locationAr = body.locationAr ? String(body.locationAr) : null;
  if ("productEn"  in body) data.productEn  = body.productEn  ? String(body.productEn)  : null;
  if ("productAr"  in body) data.productAr  = body.productAr  ? String(body.productAr)  : null;
  if ("avatar"     in body) data.avatar     = body.avatar     ? String(body.avatar)     : null;
  if ("color"      in body) data.color      = String(body.color ?? "bg-amber-100 text-amber-700");
  if ("rating"     in body) data.rating     = typeof body.rating === "number" ? body.rating : 5;
  if ("sortOrder"  in body) data.sortOrder  = typeof body.sortOrder === "number" ? body.sortOrder : 0;
  if ("active"     in body) data.active     = Boolean(body.active);
  if ("featured"   in body) data.featured   = Boolean(body.featured);

  const t = await prisma.testimonial.update({ where: { id }, data });
  return NextResponse.json(t);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
