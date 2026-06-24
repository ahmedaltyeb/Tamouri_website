import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

type AddressBody = {
  label?: string;
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  emirate?: string;
  isDefault?: boolean;
};

function validateAddress(b: AddressBody): string | null {
  if (!b.fullName?.trim()) return "fullName";
  if (!b.phone?.trim()) return "phone";
  if (!b.line1?.trim()) return "line1";
  if (!b.city?.trim()) return "city";
  if (!b.emirate?.trim()) return "emirate";
  return null;
}

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: session.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: AddressBody;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalidBody" }, { status: 400 });
  }

  const invalid = validateAddress(body);
  if (invalid) return NextResponse.json({ field: invalid, error: "fieldRequired" }, { status: 422 });

  // If this is the first address or isDefault requested, update others
  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.id },
      data: { isDefault: false },
    });
  }

  const count = await prisma.address.count({ where: { userId: session.id } });

  const address = await prisma.address.create({
    data: {
      userId: session.id,
      label: body.label?.trim() || "Home",
      fullName: body.fullName!.trim(),
      phone: body.phone!.trim(),
      line1: body.line1!.trim(),
      line2: body.line2?.trim() || null,
      city: body.city!.trim(),
      emirate: body.emirate!.trim(),
      isDefault: body.isDefault ?? count === 0, // first address is default
    },
  });

  return NextResponse.json(address, { status: 201 });
}
