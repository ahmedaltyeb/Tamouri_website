/** Multilingual text stored as JSON in the DB: { en, ar } */
export interface MLText {
  en: string;
  ar: string;
}

/**
 * Safe parser for multilingual text fields — returns { en, ar }.
 * Handles three formats:
 *   1. JSON string: '{"en":"...","ar":"..."}' — new DB format
 *   2. Plain string: "قهوة عربية" — legacy DB records (used as both languages)
 *   3. Object: { en, ar } — static product data / already-parsed values
 */
export function parseMLText(v: unknown, fallback = ""): MLText {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    return {
      en: typeof o.en === "string" ? o.en : fallback,
      ar: typeof o.ar === "string" ? o.ar : fallback,
    };
  }
  if (typeof v === "string") {
    if (v.startsWith("{")) {
      try {
        const parsed = JSON.parse(v) as Record<string, unknown>;
        if (parsed && typeof parsed.en === "string") {
          return {
            en: parsed.en,
            ar: typeof parsed.ar === "string" ? parsed.ar : parsed.en,
          };
        }
      } catch {
        // not valid JSON — fall through to legacy handling
      }
    }
    return { en: v, ar: v };
  }
  return { en: fallback, ar: fallback };
}

export interface Product {
  id: string;
  name: MLText;
  description: MLText;
  price: number;
  originalPrice?: number;
  category: string;
  categorySlug: string;
  image: string;
  images?: string[];   // all product images; image = images[0] when set
  badge?: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock: number;
}

import type { TranslationKey } from "@/lib/translations";

export interface Category {
  id: string;
  name: string;  // English fallback (used in alt text, non-translated contexts)
  slug: string;
  icon: string;
  nameKey: TranslationKey;  // key into translation system for AR/EN
}

export const categories: Category[] = [
  { id: "dates",            name: "Dates",              slug: "dates",            icon: "dates",   nameKey: "cat_dates" },
  { id: "arabic-coffee",    name: "Arabic Coffee",      slug: "arabic-coffee",    icon: "coffee",  nameKey: "cat_arabic_coffee" },
  { id: "specialty-coffee", name: "Specialty Coffee",   slug: "specialty-coffee", icon: "coffee",  nameKey: "cat_specialty_coffee" },
  { id: "tea",              name: "Tea",                slug: "tea",              icon: "tea",     nameKey: "cat_tea" },
  { id: "tools",            name: "Coffee & Tea Tools", slug: "tools",            icon: "tools",   nameKey: "cat_tools" },
  { id: "travel-tools",     name: "Travel & Outdoor",   slug: "travel-tools",     icon: "travel",  nameKey: "cat_travel_tools" },
  { id: "sweets",           name: "Sweets & Cookies",   slug: "sweets",           icon: "sweets",  nameKey: "cat_sweets" },
];

export const products: Product[] = [
  {
    id: "1",
    name: { en: "Premium Medjool Dates", ar: "تمر مجدول فاخر" },
    description: { en: "Fresh Medjool dates from the finest UAE farms, large size with rich natural sweetness. Perfect for hospitality and gifts.", ar: "تمر مجدول طازج من أجود المزارع الإماراتية، حجم كبير ونكهة غنية بالحلاوة الطبيعية. مثالي للضيافة والهدايا." },
    price: 85,
    originalPrice: 110,
    category: "التمر",
    categorySlug: "dates",
    image: "https://i.ibb.co/WvwTpK27/dates.jpg",
    badge: "الأكثر مبيعاً",
    rating: 4.9,
    reviews: 234,
    inStock: true,
    stock: 0,
  },
  {
    id: "2",
    name: { en: "Arabic Coffee with Cardamom", ar: "قهوة عربية بالهيل" },
    description: { en: "Authentic Arabic coffee blend carefully roasted with fresh cardamom. Experience genuine Gulf hospitality in every cup.", ar: "خلطة قهوة عربية أصيلة محمصة بعناية مع الهيل الطازج. تمنحك تجربة ضيافة خليجية أصيلة في كل فنجان." },
    price: 55,
    category: "القهوة العربية",
    categorySlug: "arabic-coffee",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
    rating: 4.8,
    reviews: 187,
    inStock: true,
    stock: 0,
  },
  {
    id: "3",
    name: { en: "Authentic Iranian Saffron", ar: "زعفران إيراني أصيل" },
    description: { en: "Top-grade Iranian saffron, golden in colour and rich in aroma. Adds a luxurious touch to your drinks and dishes.", ar: "زعفران إيراني من أعلى الدرجات، ذهبي اللون وغني بالرائحة. يضيف لمسة فاخرة لمشروباتك وطبخاتك." },
    price: 220,
    originalPrice: 250,
    category: "الزعفران",
    categorySlug: "saffron",
    image: "https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=600&q=80",
    badge: "فاخر",
    rating: 4.9,
    reviews: 98,
    inStock: true,
    stock: 0,
  },
  {
    id: "4",
    name: { en: "Emirati Karak Tea", ar: "شاي كرك إماراتي" },
    description: { en: "Emirati karak tea blend with cardamom, saffron and cinnamon. A wonderful fusion of authentic Gulf flavours.", ar: "خلطة شاي كرك إماراتية بالهيل والزعفران والقرفة. مزيج رائع يجمع بين النكهات الخليجية الأصيلة." },
    price: 35,
    category: "الشاي",
    categorySlug: "tea",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
    rating: 4.7,
    reviews: 312,
    inStock: true,
    stock: 0,
  },
  {
    id: "5",
    name: { en: "Golden Dallah & Cups Set", ar: "طقم دلة وفناجين ذهبي" },
    description: { en: "Luxury hospitality set including a traditional Arabic dallah with 6 ornate cups in a golden design. The perfect gift for any occasion.", ar: "طقم ضيافة فاخر يتضمن دلة عربية تقليدية مع 6 فناجين مزخرفة بتصميم ذهبي. هدية مثالية للمناسبات." },
    price: 195,
    originalPrice: 240,
    category: "مستلزمات الضيافة",
    categorySlug: "hospitality",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
    badge: "عرض خاص",
    rating: 4.8,
    reviews: 76,
    inStock: true,
    stock: 0,
  },
  {
    id: "7",
    name: { en: "Premium Hospitality Gift Box", ar: "بوكس هدايا الضيافة الفاخر" },
    description: { en: "A complete gift box containing Medjool dates, Arabic coffee, saffron and tea. Luxury packaging suitable for all occasions.", ar: "صندوق هدايا متكامل يحتوي على تمر مجدول، قهوة عربية، زعفران وشاي. تغليف فاخر مناسب لجميع المناسبات." },
    price: 250,
    category: "بوكس هدايا",
    categorySlug: "gift-boxes",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
    badge: "هدية مثالية",
    rating: 5.0,
    reviews: 203,
    inStock: true,
    stock: 0,
  },
  {
    id: "8",
    name: { en: "Premium Manual Coffee Grinder", ar: "مطحنة قهوة يدوية فاخرة" },
    description: { en: "Stainless steel manual coffee grinder giving you full control over grind size for the perfect cup.", ar: "مطحنة قهوة يدوية من الفولاذ المقاوم للصدأ، تمنحك تحكماً كاملاً في درجة الطحن للحصول على قهوتك المثالية." },
    price: 120,
    originalPrice: 150,
    category: "أدوات القهوة والشاي",
    categorySlug: "tools",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    badge: "خصم 20%",
    rating: 4.6,
    reviews: 89,
    inStock: true,
    stock: 0,
  },
  {
    id: "9",
    name: { en: "Emirati Herbal Tea", ar: "شاي الأعشاب الإماراتي" },
    description: { en: "A hand-picked natural herbal blend including chamomile, mint and ginger. A healthy drink perfect for any time of day.", ar: "خلطة أعشاب طبيعية منتقاة تشمل البابونج والنعناع والزنجبيل. مشروب صحي مثالي لكل وقت." },
    price: 28,
    category: "الشاي",
    categorySlug: "tea",
    image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=600&q=80",
    rating: 4.5,
    reviews: 167,
    inStock: true,
    stock: 0,
  },
  {
    id: "10",
    name: { en: "Turkish Tea Glasses Set", ar: "طقم أكواب شاي تركي" },
    description: { en: "Elegant glass Turkish tea cups with gilded metal holders. Adds a touch of sophistication to your hospitality table.", ar: "طقم أكواب شاي تركية زجاجية بتصميم أنيق، مع حوامل معدنية مذهبة. يضيف أناقة لطاولة الضيافة." },
    price: 75,
    category: "أدوات القهوة والشاي",
    categorySlug: "tools",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80",
    rating: 4.7,
    reviews: 54,
    inStock: true,
    stock: 0,
  },
  {
    id: "11",
    name: { en: "Eid Gift Box", ar: "بوكس هدايا العيد" },
    description: { en: "A distinctive Eid gift box with a selection of the finest dates and Emirati sweets in luxurious festive packaging.", ar: "صندوق هدايا عيد مميز يحتوي على تشكيلة من أجود التمور والحلويات الإماراتية بتغليف احتفالي فاخر." },
    price: 180,
    originalPrice: 210,
    category: "بوكس هدايا",
    categorySlug: "gift-boxes",
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&q=80",
    badge: "عرض العيد",
    rating: 4.9,
    reviews: 321,
    inStock: true,
    stock: 0,
  },
  {
    id: "12",
    name: { en: "Dark Roast Black Coffee", ar: "قهوة سوداء محمصة دارك" },
    description: { en: "Dark roasted coffee for discerning enthusiasts. Bold and rich flavour with an irresistible authentic coffee aroma.", ar: "قهوة محمصة تحميصاً غامقاً للعشاق المتذوقين. نكهة قوية وغنية مع رائحة بن أصيلة لا تُقاوم." },
    price: 45,
    originalPrice: 60,
    category: "القهوة العربية",
    categorySlug: "arabic-coffee",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
    badge: "خصم الأسبوع",
    rating: 4.8,
    reviews: 143,
    inStock: true,
    stock: 0,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(slug: string): Product[] {
  return products.filter((p) => p.categorySlug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.slice(0, 8);
}
