import { prisma } from "@/lib/prisma";

export interface CouponResult {
  valid: boolean;
  discount: number;       // percentage (10 = 10%) or fixed AED amount
  type: "percentage" | "fixed";
  minOrderAmount: number | null;
  couponId?: string;
}

export async function validateCoupon(code: string): Promise<CouponResult> {
  const normalised = code.trim().toUpperCase();
  const invalid: CouponResult = { valid: false, discount: 0, type: "percentage", minOrderAmount: null };
  if (!normalised) return invalid;

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalised },
    select: {
      id: true,
      active: true,
      discount: true,
      type: true,
      expiresAt: true,
      maxUses: true,
      usedCount: true,
      minOrderAmount: true,
    },
  });

  if (!coupon || !coupon.active) return invalid;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return invalid;
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return invalid;

  return {
    valid: true,
    discount: coupon.discount,
    type: coupon.type as "percentage" | "fixed",
    minOrderAmount: coupon.minOrderAmount,
    couponId: coupon.id,
  };
}
