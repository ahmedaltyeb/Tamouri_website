import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setCustomerCookie } from "@/lib/customer-auth";

export async function POST(request: Request) {
  let body: { token?: string; password?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalidBody" }, { status: 400 });
  }

  const { token, password } = body;

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "passwordTooShort" }, { status: 422 });
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return NextResponse.json({ error: "invalidToken" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  // Auto-login after reset
  await setCustomerCookie({ id: user.id, email: user.email, name: user.name }, false);

  return NextResponse.json({ ok: true });
}
