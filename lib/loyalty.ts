// Loyalty points configuration and helpers.
// All business rules live here — change these constants to tune the program.

import { prisma } from "@/lib/prisma";

// ── Config ────────────────────────────────────────────────────────────────────

export const LOYALTY = {
  // How many points a customer earns per AED spent (rounded down)
  POINTS_PER_AED: 1,
  // Monetary value of one point in AED (100 points = 5 AED)
  AED_PER_POINT: 0.05,
  // Minimum points required to redeem anything
  MIN_REDEEM: 100,
  // Maximum points value as a fraction of order subtotal (20%)
  MAX_REDEEM_FRACTION: 0.20,
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Points earned for a given order total. */
export function calcEarned(total: number): number {
  return Math.floor(total * LOYALTY.POINTS_PER_AED);
}

/** AED discount value for a given number of points. */
export function pointsToAed(points: number): number {
  return Math.round(points * LOYALTY.AED_PER_POINT * 100) / 100;
}

/** AED → points (for display purposes). */
export function aedToPoints(aed: number): number {
  return Math.floor(aed / LOYALTY.AED_PER_POINT);
}

/** Maximum points a customer may redeem for a given subtotal. */
export function maxRedeemable(subtotal: number, balance: number): number {
  const capByOrder = aedToPoints(subtotal * LOYALTY.MAX_REDEEM_FRACTION);
  return Math.min(balance, capByOrder);
}

/** Validate a redemption request. Returns null if valid, error string if not. */
export function validateRedeem(
  points: number,
  balance: number,
  subtotal: number,
): string | null {
  if (!Number.isInteger(points) || points <= 0) return "Invalid points value";
  if (points < LOYALTY.MIN_REDEEM) return `Minimum ${LOYALTY.MIN_REDEEM} points required`;
  if (points > balance) return "Insufficient points balance";
  const max = maxRedeemable(subtotal, balance);
  if (points > max) return `Cannot redeem more than ${max} points on this order`;
  return null;
}

// ── DB operations ─────────────────────────────────────────────────────────────

/**
 * Award points to a user for a completed order.
 * Must be called inside a prisma.$transaction or as a standalone write.
 * Safe to call multiple times — idempotent via orderId check.
 */
export async function awardPoints(
  orderId: string,
  userId: string,
  total: number,
): Promise<number> {
  // Idempotency: don't double-award if webhook fires twice
  const existing = await prisma.loyaltyTransaction.findFirst({
    where: { orderId, type: "EARNED" },
    select: { id: true },
  });
  if (existing) return 0;

  const points = calcEarned(total);
  if (points <= 0) return 0;

  await prisma.$transaction([
    prisma.loyaltyTransaction.create({
      data: {
        userId,
        orderId,
        points,
        type: "EARNED",
        description: `Earned for order #${orderId.slice(-8).toUpperCase()}`,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: { increment: points } },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { loyaltyPointsEarned: points },
    }),
  ]);

  return points;
}

/**
 * Redeem points at checkout time (inside the order creation transaction).
 * Returns the AED discount amount.
 * Caller is responsible for validation (use validateRedeem first).
 */
export async function redeemPoints(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  orderId: string,
  userId: string,
  points: number,
): Promise<number> {
  const discount = pointsToAed(points);

  await tx.loyaltyTransaction.create({
    data: {
      userId,
      orderId,
      points: -points,
      type: "REDEEMED",
      description: `Redeemed ${points} pts for order #${orderId.slice(-8).toUpperCase()}`,
    },
  });
  await tx.user.update({
    where: { id: userId },
    data: { loyaltyPoints: { decrement: points } },
  });
  await tx.order.update({
    where: { id: orderId },
    data: { loyaltyPointsUsed: points },
  });

  return discount;
}
