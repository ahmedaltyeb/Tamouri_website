import type { Metadata } from "next";
import "./globals.css";
import CartHydration from "@/components/CartHydration";
import WhatsAppButton from "@/components/WhatsAppButton";
import { LanguageProvider } from "@/contexts/LanguageContext";
import JsonLd from "@/components/JsonLd";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://tamouri.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "مربع الغربية للتمور | Marbea Al Gharbeya Dates",
    template: "%s | مربع الغربية للتمور",
  },
  description:
    "متجر إماراتي متخصص في التمور الفاخرة والقهوة العربية والزعفران والشاي. توصيل سريع لجميع إمارات الدولة. Premium UAE dates, Arabic coffee, saffron & tea — delivered across the UAE.",
  keywords: [
    "تمور", "تمر مجدول", "قهوة عربية", "زعفران", "شاي كرك", "ضيافة إماراتية",
    "مربع الغربية", "هدايا فاخرة", "الإمارات", "دبي",
    "Marbea Al Gharbeya", "UAE dates", "Arabic coffee", "saffron UAE",
    "premium dates Dubai", "Emirati hospitality gifts",
  ],
  authors: [{ name: "مربع الغربية للتمور" }],
  creator: "Marbea Al Gharbeya Dates",
  publisher: "مربع الغربية للتمور",
  alternates: { canonical: BASE },
  openGraph: {
    type: "website",
    locale: "ar_AE",
    alternateLocale: "en_AE",
    url: BASE,
    siteName: "مربع الغربية للتمور",
    title: "مربع الغربية للتمور | Marbea Al Gharbeya Dates",
    description:
      "متجر إماراتي متخصص في التمور الفاخرة والقهوة العربية والزعفران. توصيل لجميع الإمارات.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "مربع الغربية للتمور — Premium UAE Dates & Arabic Coffee",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "مربع الغربية للتمور | Marbea Al Gharbeya Dates",
    description:
      "متجر إماراتي متخصص في التمور الفاخرة والقهوة العربية والزعفران. توصيل لجميع الإمارات.",
    images: ["/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${BASE}/#store`,
  name: "مربع الغربية للتمور",
  alternateName: "Marbea Al Gharbeya Dates",
  description:
    "متجر إماراتي متخصص في التمور الفاخرة والقهوة العربية والزعفران والشاي والمنتجات التراثية الإماراتية",
  url: BASE,
  telephone: "+97150000000",
  email: "orders@marbea.ae",
  address: {
    "@type": "PostalAddress",
    addressCountry: "AE",
    addressRegion: "Dubai",
    addressLocality: "Dubai",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "25.2048",
    longitude: "55.2708",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "22:00",
    },
  ],
  currenciesAccepted: "AED",
  priceRange: "$$",
  areaServed: { "@type": "Country", name: "United Arab Emirates" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "منتجات الضيافة الإماراتية",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "تمر مجدول فاخر" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "قهوة عربية بالهيل" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "زعفران إيراني أصيل" } },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <JsonLd data={localBusinessSchema} />
      </head>
      <body className="font-cairo bg-cream text-ink antialiased">
        <LanguageProvider>
          <CartHydration />
          {children}
          <WhatsAppButton />
        </LanguageProvider>
      </body>
    </html>
  );
}
