import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";
import bcrypt from "bcryptjs";

function unauth() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getCustomerSession();
  if (!session) return unauth();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });
  if (!user) return unauth();
  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await getCustomerSession();
  if (!session) return unauth();

  let body: { name?: string; phone?: string; currentPassword?: string; newPassword?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalidBody" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.name?.trim()) updates.name = body.name.trim();
  if (body.phone !== undefined) updates.phone = body.phone.trim() || null;

  // Password change
  if (body.newPassword) {
    if (body.newPassword.length < 8) {
      return NextResponse.json({ field: "newPassword", error: "passwordTooShort" }, { status: 422 });
    }
    if (!body.currentPassword) {
      return NextResponse.json({ field: "currentPassword", error: "fieldRequired" }, { status: 422 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user?.passwordHash) return unauth();
    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ field: "currentPassword", error: "invalidCredentials" }, { status: 401 });
    updates.passwordHash = await bcrypt.hash(body.newPassword, 12);
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "noChanges" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: updates,
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json(updated);
}
