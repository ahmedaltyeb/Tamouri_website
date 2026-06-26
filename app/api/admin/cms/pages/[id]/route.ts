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
  if ("slug"       in body) data.slug       = String(body.slug ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  if ("titleEn"    in body) data.titleEn    = String(body.titleEn ?? "");
  if ("titleAr"    in body) data.titleAr    = String(body.titleAr ?? "");
  if ("contentEn"  in body) data.contentEn  = String(body.contentEn ?? "");
  if ("contentAr"  in body) data.contentAr  = String(body.contentAr ?? "");
  if ("seoTitleEn" in body) data.seoTitleEn = body.seoTitleEn ? String(body.seoTitleEn) : null;
  if ("seoTitleAr" in body) data.seoTitleAr = body.seoTitleAr ? String(body.seoTitleAr) : null;
  if ("seoDescEn"  in body) data.seoDescEn  = body.seoDescEn  ? String(body.seoDescEn)  : null;
  if ("seoDescAr"  in body) data.seoDescAr  = body.seoDescAr  ? String(body.seoDescAr)  : null;
  if ("published"  in body) data.published  = Boolean(body.published);

  const page = await prisma.page.update({ where: { id }, data });
  return NextResponse.json(page);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.page.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
