import type { Metadata } from "next";
import "./globals.css";
import CartHydration from "@/components/CartHydration";

export const metadata: Metadata = {
  title: "تموري | متجر القهوة والشاي والتمور في الإمارات",
  description: "متجر إماراتي يوفر منتجات ضيافة مختارة للاستخدام اليومي والمناسبات — قهوة، شاي، تمور وزعفران",
  keywords: "تمور، قهوة عربية، شاي، زعفران، ضيافة، الإمارات، تموري",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-cairo bg-cream text-ink antialiased">
        <CartHydration />
        {children}
      </body>
    </html>
  );
}
