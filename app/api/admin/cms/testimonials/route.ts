import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const testimonials = await prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json(testimonials);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as Record<string, unknown>;

  const nameEn = String(body.nameEn ?? "").trim();
  const nameAr = String(body.nameAr ?? "").trim();
  const reviewEn = String(body.reviewEn ?? "").trim();
  const reviewAr = String(body.reviewAr ?? "").trim();
  if (!nameEn || !nameAr || !reviewEn || !reviewAr) {
    return NextResponse.json({ error: "nameEn, nameAr, reviewEn, reviewAr required" }, { status: 400 });
  }

  const t = await prisma.testimonial.create({
    data: {
      nameEn, nameAr, reviewEn, reviewAr,
      locationEn: body.locationEn ? String(body.locationEn) : null,
      locationAr: body.locationAr ? String(body.locationAr) : null,
      productEn:  body.productEn  ? String(body.productEn)  : null,
      productAr:  body.productAr  ? String(body.productAr)  : null,
      avatar:    body.avatar    ? String(body.avatar)    : null,
      color:     body.color     ? String(body.color)     : "bg-amber-100 text-amber-700",
      rating:    typeof body.rating === "number" ? body.rating : 5,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      active:    body.active !== false,
      featured:  Boolean(body.featured),
    },
  });
  return NextResponse.json(t, { status: 201 });
}
