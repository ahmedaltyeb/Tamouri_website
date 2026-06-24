import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotRateLimit, getIp } from "@/lib/rate-limit";
import crypto from "crypto";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function POST(request: Request) {
  const rl = forgotRateLimit(getIp(request));
  if (!rl.allowed) {
    return NextResponse.json({ error: "tooManyAttempts" }, { status: 429 });
  }

  let body: { email?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalidBody" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ ok: true }); // never reveal if email exists

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return ok to prevent email enumeration
  if (!user?.passwordHash) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + EXPIRY_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });

  const resetUrl = `${BASE}/account/reset-password?token=${token}`;

  // ── Email integration ─────────────────────────────────────────────────────
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "Marbea Al Gharbeya <noreply@tamouri.com>",
        to: user.email,
        subject: "Password Reset — مربع الغربية",
        html: `
          <div dir="rtl" style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px">
            <h2 style="color:#8B5E3C">إعادة تعيين كلمة المرور</h2>
            <p>مرحباً ${user.name}،</p>
            <p>طُلب إعادة تعيين كلمة المرور لحسابك. انقر الزر أدناه لإعادة تعيينها. ينتهي الرابط خلال ساعة واحدة.</p>
            <a href="${resetUrl}"
               style="display:inline-block;background:#8B5E3C;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
              إعادة تعيين كلمة المرور
            </a>
            <p style="color:#888;font-size:12px">إذا لم تطلب ذلك، تجاهل هذا البريد.</p>
          </div>`,
      });
    } catch (e) {
      console.error("[forgot-password] email send failed:", e);
    }
  } else {
    // Dev mode: log the link
    console.log(`[DEV] Password reset link for ${email}: ${resetUrl}`);
  }

  return NextResponse.json({ ok: true });
}
