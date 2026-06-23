import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "مربع الغربية للتمور <orders@marbea.ae>";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type SendOrderConfirmationArgs = {
  to: string;
  customerName: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  shippingAddress: string;
};

export async function sendOrderConfirmation(
  args: SendOrderConfirmationArgs
): Promise<void> {
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping confirmation email");
    return;
  }

  const { to, customerName, orderId, items, total, shippingAddress } = args;
  const shortId = orderId.slice(0, 8).toUpperCase();

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f0e8;font-size:14px;color:#3d2b1f;">${item.name}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f0e8;font-size:14px;color:#6b5744;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f0e8;font-size:14px;color:#3d2b1f;text-align:right;font-weight:700;">${(item.price * item.quantity).toFixed(2)} AED</td>
      </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تأكيد الطلب / Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#3d2b1f;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">مربع الغربية للتمور</p>
              <p style="margin:4px 0 0;font-size:12px;color:#c8a96e;font-weight:600;letter-spacing:2px;text-transform:uppercase;">MARBEA AL GHARBEYA DATES</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;">

              <!-- Success badge -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:#ecfdf5;border:2px solid #6ee7b7;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">✓</div>
              </div>

              <h1 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#3d2b1f;text-align:center;">تم تأكيد طلبك!</h1>
              <p style="margin:0 0 4px;font-size:14px;color:#6b5744;text-align:center;">Order confirmed successfully</p>
              <p style="margin:0 0 28px;font-size:13px;color:#a89080;text-align:center;font-family:monospace;">Order #${shortId}</p>

              <!-- Greeting -->
              <p style="font-size:15px;color:#3d2b1f;margin:0 0 24px;">عزيزنا ${customerName}،<br><span style="font-size:13px;color:#6b5744;">Dear ${customerName},</span></p>

              <!-- Items table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <thead>
                  <tr style="background:#faf8f5;">
                    <th style="padding:10px 0;font-size:12px;color:#a89080;font-weight:700;text-align:right;text-transform:uppercase;border-bottom:2px solid #e8e0d5;">المنتج / Item</th>
                    <th style="padding:10px 0;font-size:12px;color:#a89080;font-weight:700;text-align:center;border-bottom:2px solid #e8e0d5;">الكمية / Qty</th>
                    <th style="padding:10px 0;font-size:12px;color:#a89080;font-weight:700;text-align:right;border-bottom:2px solid #e8e0d5;">السعر / Price</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="font-size:15px;font-weight:900;color:#3d2b1f;">المجموع الكلي / Total</td>
                  <td style="font-size:18px;font-weight:900;color:#c8a96e;text-align:right;">${total.toFixed(2)} AED</td>
                </tr>
              </table>

              <!-- Shipping address -->
              <div style="background:#faf8f5;border:1px solid #e8e0d5;border-radius:10px;padding:16px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#a89080;text-transform:uppercase;">عنوان التوصيل / Shipping Address</p>
                <p style="margin:0;font-size:14px;color:#3d2b1f;">${shippingAddress}</p>
              </div>

              <!-- Note -->
              <p style="font-size:13px;color:#6b5744;line-height:1.6;margin:0;">
                سنتواصل معك عبر الواتساب لتأكيد موعد التوصيل.<br>
                <span style="color:#a89080;">We'll reach out via WhatsApp to confirm your delivery slot.</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#faf8f5;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border-top:1px solid #e8e0d5;">
              <p style="margin:0;font-size:12px;color:#a89080;">© 2025 مربع الغربية للتمور · info@tamouri.ae · +971 50 000 0000</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `تأكيد الطلب #${shortId} — مربع الغربية للتمور`,
      html,
    });
  } catch (err) {
    // Email failure must never break the webhook response
    console.error("[email] Failed to send order confirmation:", err);
  }
}
