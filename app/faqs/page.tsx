import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FaqAccordion from "@/components/FaqAccordion";
import { getLang } from "@/lib/server-lang";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQs | الأسئلة الشائعة",
  description: "Frequently asked questions about ordering, delivery, products, and returns at Marbea Al Gharbeya.",
};

const content = {
  ar: {
    badge: "المساعدة",
    title: "الأسئلة الشائعة",
    subtitle: "إجابات لأكثر الأسئلة التي يطرحها عملاؤنا",
    groups: [
      {
        label: "الطلبات والدفع",
        faqs: [
          {
            q: "كيف أضع طلباً؟",
            a: "تصفح المتجر، أضف المنتجات التي تريدها إلى السلة، ثم اضغط على 'إتمام الشراء'. ستحتاج إلى إدخال بيانات التوصيل وإتمام الدفع.",
          },
          {
            q: "ما وسائل الدفع المقبولة؟",
            a: "نقبل الدفع عبر بطاقات Visa وMastercard وApple Pay. جميع المدفوعات تتم عبر بوابة دفع آمنة ومشفرة.",
          },
          {
            q: "هل يمكنني تعديل طلبي بعد تقديمه؟",
            a: "يمكن تعديل الطلب خلال ساعة من تقديمه فقط. تواصل معنا فوراً عبر الواتساب للمساعدة.",
          },
          {
            q: "هل أستطيع الطلب كضيف بدون حساب؟",
            a: "نعم، يمكنك إتمام الشراء كضيف. لكن إنشاء حساب يتيح لك متابعة طلباتك وحفظ عناوين التوصيل لطلبات قادمة.",
          },
        ],
      },
      {
        label: "التوصيل",
        faqs: [
          {
            q: "كم يستغرق التوصيل؟",
            a: "نوصل في معظم أنحاء الإمارات خلال 24 ساعة. في دبي، الطلبات المقدمة قبل الساعة 12 ظهراً تصل في نفس اليوم. بعض مناطق الشمال قد تأخذ 24–48 ساعة.",
          },
          {
            q: "هل الشحن مجاني؟",
            a: "نعم، الشحن مجاني لجميع الطلبات التي تتجاوز 200 درهم. للطلبات الأقل، تُضاف رسوم شحن 15 درهم.",
          },
          {
            q: "هل تشحنون خارج الإمارات؟",
            a: "حالياً نوصل داخل الإمارات فقط. نخطط لتوسيع نطاق التوصيل مستقبلاً.",
          },
          {
            q: "كيف أتابع طلبي؟",
            a: "ستصلك رسالة واتساب عند خروج طلبك للتوصيل. يمكنك أيضاً مراجعة صفحة 'طلباتي' في حسابك.",
          },
        ],
      },
      {
        label: "المنتجات",
        faqs: [
          {
            q: "هل التمور والمنتجات أصلية وطازجة؟",
            a: "نعم، نختار منتجاتنا بعناية من موردين موثوقين ونحرص على الطزاجة. تمورنا إماراتية وخليجية بالدرجة الأولى.",
          },
          {
            q: "هل تقدمون خدمة الجملة للشركات والأفراد؟",
            a: "نعم، نقدم خدمة الجملة للفنادق والمطاعم والشركات والمناسبات. تواصل معنا مباشرة عبر الواتساب للحصول على أسعار خاصة.",
          },
          {
            q: "هل يمكنني تخصيص بوكس الهدايا؟",
            a: "نعم، نقدم خدمة تخصيص بوكسات الهدايا للمناسبات والمؤسسات. تواصل معنا لمعرفة الخيارات المتاحة والحد الأدنى للطلب.",
          },
          {
            q: "ما مدة صلاحية التمور والمنتجات الغذائية؟",
            a: "تجدون تاريخ الصلاحية مُدرجاً على كل منتج. في العموم، التمور الطازجة تدوم من 3 إلى 6 أشهر عند تخزينها في مكان بارد وجاف.",
          },
        ],
      },
      {
        label: "الاسترجاع والمشكلات",
        faqs: [
          {
            q: "كيف أرجع منتجاً؟",
            a: "تواصل معنا خلال 24 ساعة من استلام طلبك عبر الواتساب أو البريد الإلكتروني مع صورة للمشكلة. سنتعامل مع طلبك بأسرع وقت.",
          },
          {
            q: "ماذا أفعل إذا وصل الطلب تالفاً؟",
            a: "أرسل صورة للمنتج التالف فوراً عبر الواتساب. سنعوضك برد المبلغ كاملاً أو إعادة إرسال المنتج على حسابنا.",
          },
          {
            q: "كم يستغرق استرداد المبلغ؟",
            a: "يُعالَج الاسترداد خلال 3–5 أيام عمل بعد التحقق وقبول طلب الإرجاع.",
          },
        ],
      },
    ],
    stillQuestion: "سؤالك لم يُجَب عليه؟",
    stillSub: "تواصل معنا مباشرة وسنرد عليك بأسرع وقت",
    whatsapp: "تواصل عبر الواتساب",
    backLabel: "العودة للرئيسية",
  },
  en: {
    badge: "Help",
    title: "Frequently Asked Questions",
    subtitle: "Answers to the questions our customers ask most",
    groups: [
      {
        label: "Orders & Payment",
        faqs: [
          {
            q: "How do I place an order?",
            a: "Browse the store, add products to your cart, then click 'Checkout'. You'll need to enter your delivery details and complete payment.",
          },
          {
            q: "What payment methods do you accept?",
            a: "We accept Visa, Mastercard, and Apple Pay. All payments are processed through a secure, encrypted payment gateway.",
          },
          {
            q: "Can I modify my order after placing it?",
            a: "Orders can only be modified within one hour of placement. Contact us immediately on WhatsApp for assistance.",
          },
          {
            q: "Can I order as a guest without creating an account?",
            a: "Yes, you can complete your purchase as a guest. However, creating an account lets you track your orders and save delivery addresses for future purchases.",
          },
        ],
      },
      {
        label: "Delivery",
        faqs: [
          {
            q: "How long does delivery take?",
            a: "We deliver to most areas in the UAE within 24 hours. In Dubai, orders placed before 12 PM arrive the same day. Some northern emirates may take 24–48 hours.",
          },
          {
            q: "Is shipping free?",
            a: "Yes, shipping is free on all orders above 200 AED. A 15 AED shipping fee applies to orders below that.",
          },
          {
            q: "Do you ship outside the UAE?",
            a: "We currently deliver within the UAE only. We plan to expand delivery coverage in the future.",
          },
          {
            q: "How do I track my order?",
            a: "You'll receive a WhatsApp message when your order is dispatched. You can also check 'My Orders' in your account.",
          },
        ],
      },
      {
        label: "Products",
        faqs: [
          {
            q: "Are the dates and products authentic and fresh?",
            a: "Absolutely. We carefully source our products from trusted suppliers and prioritize freshness. Our dates are primarily Emirati and Gulf-origin.",
          },
          {
            q: "Do you offer wholesale for businesses?",
            a: "Yes, we provide wholesale services for hotels, restaurants, companies, and events. Contact us directly on WhatsApp for special pricing.",
          },
          {
            q: "Can I customize a gift box?",
            a: "Yes, we offer custom gift box services for occasions and organizations. Contact us to explore available options and minimum order quantities.",
          },
          {
            q: "What is the shelf life of your food products?",
            a: "Every product has an expiry date printed on the packaging. Generally, fresh dates last 3–6 months when stored in a cool, dry place.",
          },
        ],
      },
      {
        label: "Returns & Issues",
        faqs: [
          {
            q: "How do I return a product?",
            a: "Contact us within 24 hours of receiving your order via WhatsApp or email with a photo of the issue. We'll handle your request promptly.",
          },
          {
            q: "What if my order arrives damaged?",
            a: "Send a photo of the damaged product immediately on WhatsApp. We'll either issue a full refund or resend the product at our expense.",
          },
          {
            q: "How long does a refund take?",
            a: "Refunds are processed within 3–5 business days after we verify and approve the return request.",
          },
        ],
      },
    ],
    stillQuestion: "Still have a question?",
    stillSub: "Reach out to us directly and we'll reply as soon as possible",
    whatsapp: "Chat on WhatsApp",
    backLabel: "Back to Home",
  },
};

export default async function FaqsPage() {
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

      <section className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {c.groups.map((group) => (
          <div key={group.label}>
            <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 px-1">
              {group.label}
            </h2>
            <FaqAccordion items={group.faqs} />
          </div>
        ))}

        {/* Still need help */}
        <div className="bg-gradient-to-br from-brown to-brown-dark rounded-2xl p-6 text-white text-center">
          <h3 className="font-bold text-lg mb-1">{c.stillQuestion}</h3>
          <p className="text-white/60 text-sm mb-5">{c.stillSub}</p>
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
