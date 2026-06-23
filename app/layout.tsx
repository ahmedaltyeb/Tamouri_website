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
    default: "Marbea Al Gharbeya Dates | Premium UAE Dates & Coffee",
    template: "%s | Marbea Al Gharbeya Dates",
  },
  description:
    "Premium UAE dates, Arabic coffee, saffron & tea — delivered across the UAE within 24 hours. Authentic Emirati hospitality products from Marbea Al Gharbeya.",
  keywords: [
    "تمور", "تمر مجدول", "قهوة عربية", "زعفران", "شاي كرك", "ضيافة إماراتية",
    "مربع الغربية", "هدايا فاخرة", "الإمارات", "دبي",
    "Marbea Al Gharbeya", "UAE dates", "Arabic coffee", "saffron UAE",
    "premium dates Dubai", "Emirati hospitality gifts",
  ],
  authors: [{ name: "Marbea Al Gharbeya" }],
  creator: "Marbea Al Gharbeya Dates",
  publisher: "Marbea Al Gharbeya Dates",
  alternates: { canonical: BASE },
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: BASE,
    siteName: "Marbea Al Gharbeya Dates",
    title: "Marbea Al Gharbeya Dates | Premium UAE Dates & Coffee",
    description:
      "Premium UAE dates, Arabic coffee, saffron & tea — delivered across the UAE within 24 hours.",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Marbea Al Gharbeya — Premium UAE Dates & Arabic Coffee",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Marbea Al Gharbeya Dates | Premium UAE Dates & Coffee",
    description:
      "Premium UAE dates, Arabic coffee, saffron & tea — free delivery across UAE on orders over 200 AED.",
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
  name: "Marbea Al Gharbeya Dates",
  alternateName: "مربع الغربية للتمور",
  description:
    "Premium UAE dates, Arabic coffee, saffron and tea — authentic Emirati hospitality products delivered across the UAE.",
  url: BASE,
  telephone: "+971529307250",
  email: "eltyebelnour@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressCountry: "AE",
    addressRegion: "Abu Dhabi",
    addressLocality: "Abu Dhabi",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "24.4539",
    longitude: "54.3773",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "08:00",
      closes: "23:00",
    },
  ],
  currenciesAccepted: "AED",
  priceRange: "$$",
  areaServed: { "@type": "Country", name: "United Arab Emirates" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "UAE Hospitality Products",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Premium Dates" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Arabic Coffee" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Specialty Coffee" } },
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
