import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

type Params = { params: Promise<{ id: string }> };

function unauth() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PUT(request: Request, { params }: Params) {
  const session = await getCustomerSession();
  if (!session) return unauth();

  const { id } = await params;
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: {
    label?: string; fullName?: string; phone?: string;
    line1?: string; line2?: string; city?: string; emirate?: string; isDefault?: boolean;
  };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalidBody" }, { status: 400 });
  }

  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.id, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: {
      label: body.label?.trim() ?? existing.label,
      fullName: body.fullName?.trim() ?? existing.fullName,
      phone: body.phone?.trim() ?? existing.phone,
      line1: body.line1?.trim() ?? existing.line1,
      line2: body.line2?.trim() || null,
      city: body.city?.trim() ?? existing.city,
      emirate: body.emirate?.trim() ?? existing.emirate,
      isDefault: body.isDefault ?? existing.isDefault,
    },
  });

  return NextResponse.json(address);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCustomerSession();
  if (!session) return unauth();

  const { id } = await params;
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.address.delete({ where: { id } });

  // If deleted was default, promote the oldest remaining
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: session.id },
      orderBy: { createdAt: "asc" },
    });
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }

  return NextResponse.json({ ok: true });
}
