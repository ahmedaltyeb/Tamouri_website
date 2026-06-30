import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setCustomerCookie } from "@/lib/customer-auth";
import { registerRateLimit, getIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rl = await registerRateLimit(getIp(request));
  if (!rl.allowed) {
    return NextResponse.json({ error: "tooManyAttempts" }, { status: 429 });
  }

  let body: { name?: string; email?: string; password?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalidBody" }, { status: 400 });
  }

  const { name, email, password, phone } = body;

  // Validate
  if (!name?.trim()) return NextResponse.json({ field: "name", error: "fieldRequired" }, { status: 422 });
  if (!email?.trim()) return NextResponse.json({ field: "email", error: "fieldRequired" }, { status: 422 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ field: "email", error: "invalidEmail" }, { status: 422 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ field: "password", error: "passwordTooShort" }, { status: 422 });
  }

  // Duplicate check
  const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existing?.passwordHash) {
    return NextResponse.json({ field: "email", error: "emailTaken" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  let user;
  if (existing) {
    // Guest user from previous order — upgrade to full account
    user = await prisma.user.update({
      where: { id: existing.id },
      data: { name: name.trim(), passwordHash, phone: phone?.trim() || null },
    });
  } else {
    user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        phone: phone?.trim() || null,
      },
    });
  }

  await setCustomerCookie({ id: user.id, email: user.email, name: user.name }, false);

  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
}
