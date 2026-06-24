import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setCustomerCookie } from "@/lib/customer-auth";
import { loginRateLimit, getIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rl = loginRateLimit(getIp(request));
  if (!rl.allowed) {
    return NextResponse.json({ error: "tooManyAttempts" }, { status: 429 });
  }

  let body: { email?: string; password?: string; remember?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalidBody" }, { status: 400 });
  }

  const { email, password, remember = false } = body;

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "invalidCredentials" }, { status: 401 });
  }

  await setCustomerCookie({ id: user.id, email: user.email, name: user.name }, remember);

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
