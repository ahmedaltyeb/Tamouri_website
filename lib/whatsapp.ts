// WhatsApp order notifications via CallMeBot.
// Setup (one-time, per owner):
//   1. Save the owner's WhatsApp number in the wa.me link below and send "I allow callmebot.com..."
//      https://www.callmebot.com/blog/free-api-whatsapp-messages/
//   2. Wait for a reply with your personal APIKEY
//   3. Set in Vercel env vars:
//        WHATSAPP_PHONE   = international format, no + (e.g. 971501234567)
//        WHATSAPP_APIKEY  = the key CallMeBot sent you

interface OrderNotification {
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  shippingAddress: string;
  paymentMethod: "stripe" | "cod";
}

function enabled(): boolean {
  return Boolean(process.env.WHATSAPP_PHONE && process.env.WHATSAPP_APIKEY);
}

function buildMessage(order: OrderNotification): string {
  const itemLines = order.items
    .map((i) => `  • ${i.name} ×${i.quantity} — ${i.price.toFixed(2)} AED`)
    .join("\n");

  const payment = order.paymentMethod === "stripe" ? "💳 Card (Stripe)" : "💵 Cash on Delivery";
  const shortId = order.orderId.slice(-8).toUpperCase();

  return [
    `🛒 *New Order #${shortId}*`,
    ``,
    `👤 ${order.customerName}`,
    `📞 ${order.customerPhone || "—"}`,
    `📍 ${order.shippingAddress}`,
    ``,
    `*Items:*`,
    itemLines,
    ``,
    `💰 *Total: ${order.total.toFixed(2)} AED*`,
    `${payment}`,
  ].join("\n");
}

export async function sendOrderNotification(order: OrderNotification): Promise<void> {
  if (!enabled()) {
    // Silent no-op when not configured — never throw, never block checkout
    return;
  }

  const phone = process.env.WHATSAPP_PHONE!;
  const apikey = process.env.WHATSAPP_APIKEY!;
  const message = buildMessage(order);

  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", phone);
  url.searchParams.set("text", message);
  url.searchParams.set("apikey", apikey);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      // 8s timeout — webhook/checkout must not hang on a slow external API
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      console.warn(`[whatsapp] CallMeBot returned ${res.status} for order ${order.orderId}`);
    }
  } catch (e) {
    // Network errors are warnings, not failures — the order already succeeded
    console.warn("[whatsapp] Notification failed (non-fatal):", e instanceof Error ? e.message : e);
  }
}
