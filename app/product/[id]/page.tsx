import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import JsonLd from "@/components/JsonLd";
import { prisma } from "@/lib/prisma";

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
    const product = await prisma.product.findUnique({
      where: { id },
      select: { name: true, description: true, image: true, price: true, category: true },
    });

    if (!product) return { title: "Marbea Al Gharbeya Dates" };

    const title = `${product.name} — ${product.price} AED`;
    const description = `${product.description.slice(0, 140)} — ${product.price} AED. Free delivery across UAE.`;

    return {
      title,
      description,
      alternates: { canonical: `${BASE}/product/${id}` },
      openGraph: {
        title: `${product.name} | Marbea Al Gharbeya Dates`,
        description,
        url: `${BASE}/product/${id}`,
        type: "website",
        images: [{ url: product.image, width: 800, height: 800, alt: product.name }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} — ${product.price} AED`,
        description,
        images: [product.image],
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

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categorySlug: product.categorySlug, id: { not: product.id }, inStock: true },
    take: 4,
  });

  const availability =
    product.inStock && product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${BASE}/product/${id}/#product`,
    name: product.name,
    description: product.description,
    image: [product.image],
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "مربع الغربية للتمور",
    },
    offers: {
      "@type": "Offer",
      url: `${BASE}/product/${id}`,
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
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: BASE },
      { "@type": "ListItem", position: 2, name: "المتجر", item: `${BASE}/shop` },
      { "@type": "ListItem", position: 3, name: product.category, item: `${BASE}/shop?category=${product.categorySlug}` },
      { "@type": "ListItem", position: 4, name: product.name, item: `${BASE}/product/${id}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `هل ${product.name} متوفر للشراء الآن؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: product.inStock && product.stock > 0
            ? `نعم، ${product.name} متوفر بسعر ${product.price} درهم إماراتي. أضفه إلى السلة وادفع بسهولة عبر بطاقة الائتمان.`
            : `${product.name} غير متوفر حالياً. يرجى مراجعة المتجر لاحقاً.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the price of ${product.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${product.name} is available for ${product.price} AED${product.originalPrice ? ` (was ${product.originalPrice} AED)` : ""}. Free delivery across UAE on orders over 200 AED.`,
        },
      },
      {
        "@type": "Question",
        name: `هل توصلون ${product.name} لدبي وجميع إمارات الدولة؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `نعم، نوصل ${product.name} لجميع إمارات الدولة — دبي، أبوظبي، الشارقة، عجمان، رأس الخيمة وسواها. الطلبات فوق 200 درهم توصيل مجاني.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${product.name} a good gift?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${product.name} is a popular choice for gifts and hospitality in the UAE. ${product.description}`,
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
