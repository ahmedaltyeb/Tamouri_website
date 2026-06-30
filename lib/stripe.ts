import Stripe from "stripe";

// Lazy singleton — only throws at call time, not at module import.
// Lets the server boot without Stripe keys (COD mode) and keeps
// Stripe out of bundles that never call getStripe().
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it in Vercel → Settings → Environment Variables.",
      );
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

/** true when STRIPE_SECRET_KEY is present (online payment mode). */
export const stripeEnabled = (): boolean =>
  Boolean(process.env.STRIPE_SECRET_KEY);
