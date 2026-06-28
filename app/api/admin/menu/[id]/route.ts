import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { invalidateCmsCache } from "@/lib/site-settings";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
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
  if ("titleEn"      in body) data.titleEn      = String(body.titleEn ?? "").trim();
  if ("titleAr"      in body) data.titleAr      = String(body.titleAr ?? "").trim();
  if ("type"         in body) data.type         = String(body.type ?? "url");
  if ("url"          in body) data.url          = body.url ? String(body.url).trim() : null;
  if ("targetId"     in body) data.targetId     = body.targetId ? String(body.targetId).trim() : null;
  if ("icon"         in body) data.icon         = body.icon ? String(body.icon).trim() : null;
  if ("image"        in body) data.image        = body.image ? String(body.image).trim() : null;
  if ("badge"        in body) data.badge        = body.badge ? String(body.badge).trim() : null;
  if ("sortOrder"    in body) data.sortOrder    = Number(body.sortOrder ?? 0);
  if ("active"       in body) data.active       = Boolean(body.active);
  if ("openInNewTab" in body) data.openInNewTab = Boolean(body.openInNewTab);

  try {
    const item = await prisma.menuItem.update({ where: { id }, data });
    invalidateCmsCache();
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.menuItem.delete({ where: { id } });
    invalidateCmsCache();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
