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

  const methods = await prisma.paymentMethod.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(methods);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; image?: string; enabled?: boolean; sortOrder?: number };
  try {
    body = await request.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 422 });
  }
  if (!body.image?.trim()) {
    return NextResponse.json({ error: "image is required" }, { status: 422 });
  }

  const count = await prisma.paymentMethod.count();
  const method = await prisma.paymentMethod.create({
    data: {
      name: body.name.trim(),
      image: body.image.trim(),
      enabled: body.enabled ?? true,
      sortOrder: body.sortOrder ?? count,
    },
  });

  invalidateCmsCache();
  return NextResponse.json(method, { status: 201 });
}
