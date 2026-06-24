import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { invalidateCmsCache } from "@/lib/site-settings";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
  if ("titleEn" in body) data.titleEn = String(body.titleEn ?? "");
  if ("titleAr" in body) data.titleAr = String(body.titleAr ?? "");
  if ("links" in body) data.links = JSON.stringify(Array.isArray(body.links) ? body.links : []);
  if ("order" in body) data.order = Number(body.order ?? 0);
  if ("active" in body) data.active = Boolean(body.active);

  try {
    const section = await prisma.footerSection.update({ where: { id }, data });
    invalidateCmsCache();
    return NextResponse.json(section);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.footerSection.delete({ where: { id } });
    invalidateCmsCache();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
