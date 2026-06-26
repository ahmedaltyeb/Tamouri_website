import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session : null;
}

// Starter pages to seed — upsert by slug so re-running is idempotent
const STARTER_PAGES = [
  {
    slug: "gift-boxes",
    titleEn: "Gift Boxes",
    titleAr: "هدايا مغلفة",
    contentEn: `<h2>Premium Gift Boxes</h2>
<p>Discover our curated selection of luxury gift boxes, perfect for every occasion. Each box is carefully crafted with the finest dates, Arabic coffee, saffron, and traditional sweets from the UAE.</p>
<h2>Why Choose Our Gift Boxes?</h2>
<ul>
  <li>Premium quality products sourced directly from certified farms</li>
  <li>Elegant, hand-packaged presentation boxes</li>
  <li>Perfect for Eid, weddings, corporate events, and celebrations</li>
  <li>Same-day and next-day delivery across the UAE</li>
  <li>Customizable options available for bulk orders</li>
</ul>
<p>Browse our full collection in the <a href="/shop?category=gift-boxes">Gift Boxes shop section</a> or contact us for custom corporate orders.</p>`,
    contentAr: `<h2>صناديق الهدايا الفاخرة</h2>
<p>اكتشف مجموعتنا المختارة من صناديق الهدايا الفاخرة، المثالية لكل مناسبة. كل صندوق مُعدّ بعناية فائقة يحتوي على أجود التمور والقهوة العربية والزعفران والحلويات التقليدية الإماراتية.</p>
<h2>لماذا تختار صناديق هداياناز</h2>
<ul>
  <li>منتجات عالية الجودة مصدرها مباشرة من مزارع معتمدة</li>
  <li>صناديق عرض أنيقة مغلفة يدوياً</li>
  <li>مثالية للعيد وحفلات الزفاف والمناسبات المؤسسية والاحتفالات</li>
  <li>توصيل في نفس اليوم واليوم التالي في جميع أنحاء الإمارات</li>
  <li>خيارات قابلة للتخصيص للطلبات بالجملة</li>
</ul>
<p>تصفح مجموعتنا الكاملة في <a href="/shop?category=gift-boxes">قسم صناديق الهدايا</a> أو تواصل معنا للطلبات المؤسسية المخصصة.</p>`,
    seoTitleEn: "Gift Boxes — Premium UAE Dates & Arabic Coffee Gift Sets",
    seoTitleAr: "صناديق الهدايا — تمور إماراتية فاخرة وقهوة عربية",
    seoDescEn: "Shop premium gift boxes featuring UAE dates, Arabic coffee, saffron & sweets. Perfect for Eid, weddings & corporate events. Same-day delivery across UAE.",
    seoDescAr: "تسوق صناديق هدايا فاخرة تحتوي على تمور إماراتية وقهوة عربية وزعفران وحلويات. مثالية للعيد والأعراس والمناسبات المؤسسية.",
    published: true,
  },
  {
    slug: "weekly-deals",
    titleEn: "Weekly Deals",
    titleAr: "العروض الأسبوعية",
    contentEn: `<h2>This Week's Best Deals</h2>
<p>Don't miss our handpicked weekly offers on premium dates, Arabic coffee, saffron, and gift sets. New deals every week — save big on your favourites.</p>
<h2>How It Works</h2>
<ul>
  <li>New deals published every Sunday</li>
  <li>Discounts of up to 30% on selected products</li>
  <li>Limited stock — first come, first served</li>
  <li>Deals apply automatically at checkout — no coupon needed</li>
</ul>
<p>Check our <a href="/shop?category=deals">deals section</a> for the latest offers, or subscribe to our WhatsApp channel to be notified the moment new deals go live.</p>`,
    contentAr: `<h2>أفضل عروض هذا الأسبوع</h2>
<p>لا تفوّت عروضنا الأسبوعية المختارة بعناية على التمور الفاخرة والقهوة العربية والزعفران وصناديق الهدايا. عروض جديدة كل أسبوع — وفّر الكثير على منتجاتك المفضلة.</p>
<h2>كيف يعمل النظام</h2>
<ul>
  <li>عروض جديدة تُنشر كل يوم أحد</li>
  <li>خصومات تصل إلى 30% على منتجات مختارة</li>
  <li>كميات محدودة — الأول يُخدَم أولاً</li>
  <li>تُطبَّق العروض تلقائياً عند الدفع — لا حاجة لكوبون</li>
</ul>
<p>تحقق من <a href="/shop?category=deals">قسم العروض</a> للاطلاع على أحدث الصفقات، أو اشترك في قناة الواتساب ليصلك إشعار فور نشر عروض جديدة.</p>`,
    seoTitleEn: "Weekly Deals — Best Prices on Dates, Coffee & Gift Boxes UAE",
    seoTitleAr: "العروض الأسبوعية — أفضل أسعار التمور والقهوة وصناديق الهدايا",
    seoDescEn: "Weekly discounts on premium UAE dates, Arabic coffee, saffron & gift sets. Up to 30% off. New deals every Sunday. Fast delivery across UAE.",
    seoDescAr: "خصومات أسبوعية على التمور الإماراتية والقهوة العربية والزعفران وصناديق الهدايا. خصم يصل إلى 30%. عروض جديدة كل أحد.",
    published: true,
  },
];

// POST /api/admin/cms/pages/seed — idempotent upsert of starter pages
export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.all(
    STARTER_PAGES.map((p) =>
      prisma.page.upsert({
        where: { slug: p.slug },
        create: p,
        // Don't overwrite if already edited by admin
        update: {},
      }),
    ),
  );

  return NextResponse.json({ seeded: results.map((r) => r.slug) });
}
