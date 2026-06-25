import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

type Ctx = { params: Promise<{ id: string }> };

// ── PUT /api/admin/categories/[id] ───────────────────────────────────────────

export async function PUT(request: Request, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if ("nameEn"    in body) data.nameEn    = body.nameEn    ? String(body.nameEn)    : null;
  if ("nameAr"    in body) data.nameAr    = body.nameAr    ? String(body.nameAr)    : null;
  if ("image"     in body) data.image     = body.image     ? String(body.image)     : null;
  if ("sortOrder" in body) data.sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : 0;
  if ("active"    in body) data.active    = Boolean(body.active);
  if ("featured"  in body) data.featured  = Boolean(body.featured);
  if ("name"      in body) data.name      = String(body.name ?? "").trim() || undefined;
  if ("slug"      in body) data.slug      = String(body.slug ?? "").trim() || undefined;

  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(category);
}

// ── DELETE /api/admin/categories/[id] ────────────────────────────────────────

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
