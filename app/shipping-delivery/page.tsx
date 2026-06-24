import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getLang } from "@/lib/server-lang";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & Delivery | الشحن والتوصيل",
  description: "Everything you need to know about shipping and delivery at Marbea Al Gharbeya.",
};

const content = {
  ar: {
    badge: "التوصيل",
    title: "الشحن والتوصيل",
    subtitle: "نوصل طلبك في أسرع وقت ممكن — داخل الإمارات فقط.",
    zones: [
      { emirate: "دبي", time: "خلال 24 ساعة", note: "للطلبات قبل الساعة 12 ظهراً — توصيل في نفس اليوم" },
      { emirate: "أبوظبي", time: "خلال 24 ساعة", note: "" },
      { emirate: "الشارقة", time: "خلال 24 ساعة", note: "" },
      { emirate: "عجمان", time: "خلال 24 ساعة", note: "" },
      { emirate: "رأس الخيمة", time: "24 – 48 ساعة", note: "" },
      { emirate: "الفجيرة", time: "24 – 48 ساعة", note: "" },
      { emirate: "أم القيوين", time: "24 – 48 ساعة", note: "" },
    ],
    sections: [
      {
        title: "تكلفة الشحن",
        icon: "box",
        items: [
          "شحن مجاني لجميع الطلبات التي تتجاوز 200 درهم",
          "رسوم شحن 15 درهم للطلبات أقل من 200 درهم",
          "لا نشحن خارج الإمارات حالياً",
        ],
      },
      {
        title: "التغليف",
        icon: "shield",
        items: [
          "نستخدم عبوات مقاومة للحرارة لحماية التمور والمنتجات الحساسة",
          "بوكسات الهدايا تُعبأ برتيباً فاخراً جاهزاً للإهداء",
          "جميع المنتجات السائلة محكمة الإغلاق لمنع التسريب",
        ],
      },
      {
        title: "تتبع طلبك",
        icon: "location",
        items: [
          "ستصلك رسالة واتساب بمجرد خروج طلبك للتوصيل",
          "يمكنك متابعة حالة طلبك من صفحة طلباتي في حسابك",
          "للاستفسار عن الطلب تواصل معنا مباشرة عبر الواتساب",
        ],
      },
    ],
    zoneTitle: "مناطق التوصيل والمواعيد",
    contactTitle: "سؤال عن شحنتك؟",
    contactSub: "فريقنا جاهز للمساعدة من السبت إلى الخميس",
    whatsapp: "تواصل عبر الواتساب",
    backLabel: "العودة للرئيسية",
    sameDayNote: "توصيل نفس اليوم",
  },
  en: {
    badge: "Delivery",
    title: "Shipping & Delivery",
    subtitle: "We deliver your order as fast as possible — within the UAE only.",
    zones: [
      { emirate: "Dubai", time: "Within 24 hours", note: "Orders before 12 PM — same-day delivery" },
      { emirate: "Abu Dhabi", time: "Within 24 hours", note: "" },
      { emirate: "Sharjah", time: "Within 24 hours", note: "" },
      { emirate: "Ajman", time: "Within 24 hours", note: "" },
      { emirate: "Ras Al Khaimah", time: "24–48 hours", note: "" },
      { emirate: "Fujairah", time: "24–48 hours", note: "" },
      { emirate: "Umm Al Quwain", time: "24–48 hours", note: "" },
    ],
    sections: [
      {
        title: "Shipping Costs",
        icon: "box",
        items: [
          "Free shipping on all orders above 200 AED",
          "15 AED shipping fee for orders below 200 AED",
          "We do not ship outside the UAE at this time",
        ],
      },
      {
        title: "Packaging",
        icon: "shield",
        items: [
          "We use heat-resistant packaging to protect dates and sensitive products",
          "Gift boxes are packed in premium presentation-ready packaging",
          "All liquid products are sealed to prevent leakage",
        ],
      },
      {
        title: "Track Your Order",
        icon: "location",
        items: [
          "You'll receive a WhatsApp message as soon as your order is dispatched",
          "Track your order status from 'My Orders' in your account",
          "For delivery inquiries, contact us directly on WhatsApp",
        ],
      },
    ],
    zoneTitle: "Delivery Zones & Timeframes",
    contactTitle: "Question About Your Shipment?",
    contactSub: "Our team is ready to help, Saturday to Thursday",
    whatsapp: "Chat on WhatsApp",
    backLabel: "Back to Home",
    sameDayNote: "Same-day delivery",
  },
};

const iconPaths: Record<string, string> = {
  box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  location: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
};

const iconColors: Record<string, string> = {
  box: "bg-amber-50 text-amber-600",
  shield: "bg-green-50 text-green-600",
  location: "bg-blue-50 text-blue-600",
};

export default async function ShippingDeliveryPage() {
  const lang = await getLang();
  const c = content[lang];
  const isRtl = lang === "ar";

  return (
    <main className="min-h-screen bg-cream" dir={isRtl ? "rtl" : "ltr"}>
      <TopBar />
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-stone-900 to-stone-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-gold/20 text-gold text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            {c.badge}
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-3">{c.title}</h1>
          <p className="text-white/60 text-base max-w-xl mx-auto">{c.subtitle}</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12 space-y-6">

        {/* Delivery zones table */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
          <h2 className="font-bold text-stone-900 text-base mb-4">{c.zoneTitle}</h2>
          <div className="space-y-2">
            {c.zones.map((zone) => (
              <div
                key={zone.emirate}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 bg-gold rounded-full flex-none" />
                  <span className="text-sm font-medium text-stone-800">{zone.emirate}</span>
                  {zone.note && (
                    <span className="hidden sm:inline text-xs text-stone-400">— {zone.note}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex-none">
                  {zone.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info sections */}
        {c.sections.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-none ${iconColors[section.icon]}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[section.icon]} />
                </svg>
              </div>
              <h2 className="font-bold text-stone-900 text-base">{section.title}</h2>
            </div>
            <ul className="space-y-2.5">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-stone-600 text-sm leading-relaxed">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full flex-none mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* CTA */}
        <div className="bg-gradient-to-br from-brown to-brown-dark rounded-2xl p-6 text-white text-center">
          <h3 className="font-bold text-lg mb-1">{c.contactTitle}</h3>
          <p className="text-white/60 text-sm mb-5">{c.contactSub}</p>
          <a
            href="https://wa.me/971529307250"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20c05a] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {c.whatsapp}
          </a>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-stone-400 hover:text-gold transition-colors cursor-pointer">
            {isRtl ? "→" : "←"} {c.backLabel}
          </Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
