import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

// ── GET /api/admin/categories ─────────────────────────────────────────────────

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json(categories);
}

// ── POST /api/admin/categories ────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? "").trim();
  if (!name || !slug) {
    return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      nameEn:    body.nameEn    ? String(body.nameEn)    : null,
      nameAr:    body.nameAr    ? String(body.nameAr)    : null,
      image:     body.image     ? String(body.image)     : null,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      active:    body.active !== false,
      featured:  Boolean(body.featured),
    },
  });

  return NextResponse.json(category, { status: 201 });
}

// ── PATCH /api/admin/categories — bulk reorder ────────────────────────────────

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as { orderedIds?: string[] };
  const ids = body.orderedIds;
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "orderedIds array required" }, { status: 400 });
  }

  await Promise.all(
    ids.map((id, index) =>
      prisma.category.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );

  return NextResponse.json({ ok: true });
}
