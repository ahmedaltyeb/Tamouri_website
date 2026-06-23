-- Add stripeSessionId to Order for Stripe Checkout integration
ALTER TABLE "Order" ADD COLUMN "stripeSessionId" TEXT;
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
