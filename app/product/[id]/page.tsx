import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import JsonLd from "@/components/JsonLd";
import { prisma } from "@/lib/prisma";
import { parseMLText } from "@/lib/products";
import { getLang } from "@/lib/server-lang";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "https://tamouri.onrender.com";

// Render on demand; cache for 5 minutes, then revalidate in the background
export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const [product, lang] = await Promise.all([
      prisma.product.findUnique({
        where: { id },
        select: { name: true, description: true, image: true, price: true, category: true },
      }),
      getLang(),
    ]);

    if (!product) return { title: "Marbea Al Gharbeya Dates" };

    const name = parseMLText(product.name);
    const desc = parseMLText(product.description);
    const localName = name[lang];
    const localDesc = desc[lang];

    const title = `${localName} — ${product.price} AED`;
    const description = `${localDesc.slice(0, 140)} — ${product.price} AED. Free delivery across UAE.`;
    const canonicalUrl = `${BASE}/${lang}/product/${id}`;

    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `${localName} | Marbea Al Gharbeya Dates`,
        description,
        url: canonicalUrl,
        type: "website",
        images: product.image
          ? [{ url: product.image, width: 800, height: 800, alt: localName }]
          : [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "Marbea Al Gharbeya" }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${localName} — ${product.price} AED`,
        description,
        images: product.image ? [product.image] : [`${BASE}/og-image.png`],
      },
    };
  } catch {
    return { title: "Marbea Al Gharbeya Dates" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, lang] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getLang(),
  ]);
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categorySlug: product.categorySlug, id: { not: product.id }, inStock: true },
    take: 4,
  });

  const name = parseMLText(product.name);
  const desc = parseMLText(product.description);
  const localName = name[lang];
  const localDesc = desc[lang];
  const canonicalUrl = `${BASE}/${lang}/product/${id}`;

  const availability =
    product.inStock && product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonicalUrl}/#product`,
    name: localName,
    description: localDesc,
    image: [product.image],
    sku: product.sku ?? product.id,
    brand: {
      "@type": "Brand",
      name: "مربع الغربية للتمور",
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "AED",
      price: product.price.toString(),
      availability,
      seller: { "@type": "Organization", name: "مربع الغربية للتمور" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "AE",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
        },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating.toString(),
      reviewCount: product.reviews.toString(),
      bestRating: "5",
      worstRating: "1",
    },
    category: product.category,
    inProductGroupWithID: product.categorySlug,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "ar" ? "الرئيسية" : "Home", item: `${BASE}/${lang}` },
      { "@type": "ListItem", position: 2, name: lang === "ar" ? "المتجر" : "Shop", item: `${BASE}/${lang}/shop` },
      { "@type": "ListItem", position: 3, name: product.category, item: `${BASE}/${lang}/shop?category=${product.categorySlug}` },
      { "@type": "ListItem", position: 4, name: localName, item: canonicalUrl },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `هل ${name.ar} متوفر للشراء الآن؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: product.inStock && product.stock > 0
            ? `نعم، ${name.ar} متوفر بسعر ${product.price} درهم إماراتي. أضفه إلى السلة وادفع بسهولة عبر بطاقة الائتمان.`
            : `${name.ar} غير متوفر حالياً. يرجى مراجعة المتجر لاحقاً.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the price of ${name.en}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${name.en} is available for ${product.price} AED${product.originalPrice ? ` (was ${product.originalPrice} AED)` : ""}. Free delivery across UAE on orders over 200 AED.`,
        },
      },
      {
        "@type": "Question",
        name: `هل توصلون ${name.ar} لدبي وجميع إمارات الدولة؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `نعم، نوصل ${name.ar} لجميع إمارات الدولة — دبي، أبوظبي، الشارقة، عجمان، رأس الخيمة وسواها. الطلبات فوق 200 درهم توصيل مجاني.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${name.en} a good gift?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${name.en} is a popular choice for gifts and hospitality in the UAE. ${desc.en}`,
        },
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <TopBar />
      <Header />
      <ProductDetail product={product} related={related} />
      <Footer />
    </main>
  );
}
