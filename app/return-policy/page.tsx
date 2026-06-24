import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { getLang } from "@/lib/server-lang";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return Policy | سياسة الاسترجاع",
  description: "Learn about our return and refund policy for Marbea Al Gharbeya products.",
};

const content = {
  ar: {
    badge: "سياسات المتجر",
    title: "سياسة الاسترجاع",
    subtitle: "نريدك أن تكون سعيداً بكل طلب. إذا لم تكن كذلك، نحن هنا للمساعدة.",
    sections: [
      {
        title: "المنتجات القابلة للاسترجاع",
        icon: "check",
        items: [
          "المنتجات غير الغذائية (أدوات القهوة، الدلال، الفناجين) — خلال 30 يوماً من الاستلام",
          "المنتجات المغلقة والتي لم تُفتح ولم تُستخدم",
          "المنتجات التي وصلت تالفة أو مختلفة عما طلبته",
          "المنتجات المنتهية الصلاحية أو التي تبدو فاسدة",
        ],
      },
      {
        title: "المنتجات غير القابلة للاسترجاع",
        icon: "x",
        items: [
          "المواد الغذائية المفتوحة (التمور، القهوة، الشاي، الزعفران)",
          "بوكسات الهدايا بعد فتحها",
          "المنتجات المشتراة بخصم أو في عروض التصفية",
          "المنتجات المُخصصة أو ذات الطلب الخاص",
        ],
      },
      {
        title: "كيفية طلب الاسترجاع",
        icon: "info",
        items: [
          "تواصل معنا خلال 24 ساعة من استلام طلبك عبر الواتساب أو البريد الإلكتروني",
          "أرسل صورة واضحة للمنتج والمشكلة",
          "سنرد عليك خلال ساعة عمل واحدة",
          "سنرسل مندوباً لاستلام المنتج مجاناً في حالة الخطأ أو التلف",
        ],
      },
      {
        title: "موعد الاسترداد المالي",
        icon: "time",
        items: [
          "يُعالَج الاسترداد خلال 3 – 5 أيام عمل بعد استلام المنتج",
          "يُرد المبلغ إلى نفس وسيلة الدفع المستخدمة",
          "للدفع النقدي: استرداد مباشر أو رصيد في المتجر حسب اختيارك",
        ],
      },
    ],
    contactTitle: "تحتاج مساعدة؟",
    contactSub: "فريق خدمة العملاء متاح 6 أيام في الأسبوع",
    whatsapp: "تواصل عبر الواتساب",
    email: "أرسل بريداً إلكترونياً",
    backLabel: "العودة للرئيسية",
  },
  en: {
    badge: "Store Policies",
    title: "Return Policy",
    subtitle: "We want you to be happy with every order. If you're not, we're here to help.",
    sections: [
      {
        title: "Eligible for Return",
        icon: "check",
        items: [
          "Non-food items (coffee tools, dallah pots, cups) — within 30 days of receipt",
          "Sealed, unopened, and unused products",
          "Products that arrived damaged or different from what you ordered",
          "Products that are expired or appear spoiled upon delivery",
        ],
      },
      {
        title: "Not Eligible for Return",
        icon: "x",
        items: [
          "Opened food products (dates, coffee, tea, saffron)",
          "Gift boxes that have been opened",
          "Products purchased on sale or clearance",
          "Customized or special-order products",
        ],
      },
      {
        title: "How to Request a Return",
        icon: "info",
        items: [
          "Contact us within 24 hours of receiving your order via WhatsApp or email",
          "Send a clear photo of the product and the issue",
          "We'll respond within one business hour",
          "For damaged or incorrect items, we'll arrange a free pick-up",
        ],
      },
      {
        title: "When Will I Get My Refund?",
        icon: "time",
        items: [
          "Refunds are processed within 3–5 business days after we receive the product",
          "The amount is returned to the same payment method used",
          "For cash payments: direct refund or store credit — your choice",
        ],
      },
    ],
    contactTitle: "Need Help?",
    contactSub: "Our customer service team is available 6 days a week",
    whatsapp: "Chat on WhatsApp",
    email: "Send an Email",
    backLabel: "Back to Home",
  },
};

const iconPaths: Record<string, string> = {
  check:
    "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  x:
    "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  info:
    "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  time:
    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
};

const iconColors: Record<string, string> = {
  check: "bg-green-50 text-green-600",
  x: "bg-red-50 text-red-600",
  info: "bg-blue-50 text-blue-600",
  time: "bg-amber-50 text-amber-600",
};

export default async function ReturnPolicyPage() {
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

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 py-12 space-y-6">
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

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-brown to-brown-dark rounded-2xl p-6 text-white text-center">
          <h3 className="font-bold text-lg mb-1">{c.contactTitle}</h3>
          <p className="text-white/60 text-sm mb-5">{c.contactSub}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/971529307250"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20c05a] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {c.whatsapp}
            </a>
            <a
              href="mailto:info@tamouri.com"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {c.email}
            </a>
          </div>
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
