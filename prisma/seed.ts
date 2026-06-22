import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "تمر مجدول فاخر",
    description: "تمر مجدول طازج من أجود المزارع الإماراتية، حجم كبير ونكهة غنية بالحلاوة الطبيعية. مثالي للضيافة والهدايا.",
    price: 85,
    originalPrice: 110,
    category: "التمر",
    categorySlug: "dates",
    image: "https://images.unsplash.com/photo-1559628233-100c798642d6?w=600&q=80",
    badge: "الأكثر مبيعاً",
    rating: 4.9,
    reviews: 234,
    inStock: true,
  },
  {
    name: "قهوة عربية بالهيل",
    description: "خلطة قهوة عربية أصيلة محمصة بعناية مع الهيل الطازج. تمنحك تجربة ضيافة خليجية أصيلة في كل فنجان.",
    price: 55,
    category: "القهوة العربية",
    categorySlug: "arabic-coffee",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
    rating: 4.8,
    reviews: 187,
    inStock: true,
  },
  {
    name: "زعفران إيراني أصيل",
    description: "زعفران إيراني من أعلى الدرجات، ذهبي اللون وغني بالرائحة. يضيف لمسة فاخرة لمشروباتك وطبخاتك.",
    price: 220,
    originalPrice: 250,
    category: "الزعفران",
    categorySlug: "saffron",
    image: "https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=600&q=80",
    badge: "فاخر",
    rating: 4.9,
    reviews: 98,
    inStock: true,
  },
  {
    name: "شاي كرك إماراتي",
    description: "خلطة شاي كرك إماراتية بالهيل والزعفران والقرفة. مزيج رائع يجمع بين النكهات الخليجية الأصيلة.",
    price: 35,
    category: "الشاي",
    categorySlug: "tea",
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
    rating: 4.7,
    reviews: 312,
    inStock: true,
  },
  {
    name: "طقم دلة وفناجين ذهبي",
    description: "طقم ضيافة فاخر يتضمن دلة عربية تقليدية مع 6 فناجين مزخرفة بتصميم ذهبي. هدية مثالية للمناسبات.",
    price: 195,
    originalPrice: 240,
    category: "مستلزمات الضيافة",
    categorySlug: "hospitality",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
    badge: "عرض خاص",
    rating: 4.8,
    reviews: 76,
    inStock: true,
  },
  {
    name: "بوكس هدايا الضيافة الفاخر",
    description: "صندوق هدايا متكامل يحتوي على تمر مجدول، قهوة عربية، زعفران وشاي. تغليف فاخر مناسب لجميع المناسبات.",
    price: 250,
    category: "بوكس هدايا",
    categorySlug: "gift-boxes",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
    badge: "هدية مثالية",
    rating: 5.0,
    reviews: 203,
    inStock: true,
  },
  {
    name: "مطحنة قهوة يدوية فاخرة",
    description: "مطحنة قهوة يدوية من الفولاذ المقاوم للصدأ، تمنحك تحكماً كاملاً في درجة الطحن للحصول على قهوتك المثالية.",
    price: 120,
    originalPrice: 150,
    category: "أدوات القهوة والشاي",
    categorySlug: "tools",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    badge: "خصم 20%",
    rating: 4.6,
    reviews: 89,
    inStock: true,
  },
  {
    name: "شاي الأعشاب الإماراتي",
    description: "خلطة أعشاب طبيعية منتقاة تشمل البابونج والنعناع والزنجبيل. مشروب صحي مثالي لكل وقت.",
    price: 28,
    category: "الشاي",
    categorySlug: "tea",
    image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=600&q=80",
    rating: 4.5,
    reviews: 167,
    inStock: true,
  },
  {
    name: "طقم أكواب شاي تركي",
    description: "طقم أكواب شاي تركية زجاجية بتصميم أنيق، مع حوامل معدنية مذهبة. يضيف أناقة لطاولة الضيافة.",
    price: 75,
    category: "أدوات القهوة والشاي",
    categorySlug: "tools",
    image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80",
    rating: 4.7,
    reviews: 54,
    inStock: true,
  },
  {
    name: "بوكس هدايا العيد",
    description: "صندوق هدايا عيد مميز يحتوي على تشكيلة من أجود التمور والحلويات الإماراتية بتغليف احتفالي فاخر.",
    price: 180,
    originalPrice: 210,
    category: "بوكس هدايا",
    categorySlug: "gift-boxes",
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&q=80",
    badge: "عرض العيد",
    rating: 4.9,
    reviews: 321,
    inStock: true,
  },
  {
    name: "قهوة سوداء محمصة دارك",
    description: "قهوة محمصة تحميصاً غامقاً للعشاق المتذوقين. نكهة قوية وغنية مع رائحة بن أصيلة لا تُقاوم.",
    price: 45,
    originalPrice: 60,
    category: "القهوة العربية",
    categorySlug: "arabic-coffee",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
    badge: "خصم الأسبوع",
    rating: 4.8,
    reviews: 143,
    inStock: true,
  },
];

async function main() {
  console.log("Seeding products…");

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`✓ Seeded ${products.length} products`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
