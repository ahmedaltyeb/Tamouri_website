# تموري — Tamouri 🛍️

> **متجر القهوة والشاي والتمور في الإمارات**  
> UAE Hospitality Products E-Commerce Store

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 About

**Tamouri (تموري)** is a full-featured Arabic RTL e-commerce website for a UAE-based hospitality products store. It sells premium dates, Arabic coffee, tea, saffron, hospitality supplies, and gift boxes — all with an authentic Emirati shopping experience.

Built with **Next.js 15 App Router**, fully **Arabic RTL**, and **mobile-first** responsive design.

---

## ✨ Features

- 🌐 **Full Arabic RTL layout** — direction, typography, and UX optimized for Arabic readers
- 🛒 **Shopping cart** — add, remove, update quantity, persistent across sessions
- ❤️ **Wishlist** — save favourite products with counter in header
- 🔍 **Search & filter** — live search + category filtering on shop page
- 📱 **Mobile-first** — responsive grid, horizontal scroll category pills
- ⚡ **SSR-safe** — no localStorage crashes on server, polyfilled for broken environments
- 🎨 **Warm earthy design** — cream, brown, gold color palette with Cairo Arabic font
- 🛍️ **12 mock products** across 8 categories with Unsplash images

---

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — hero, categories, featured products, testimonials |
| `/shop` | Full product catalog with search, filter, and sort |
| `/product/[id]` | Single product page with related products |
| `/cart` | Cart with quantity controls and order summary |
| `/contact` | Contact form with WhatsApp CTA |

---

## 🗂️ Product Categories

1. التمر — Dates
2. القهوة العربية — Arabic Coffee
3. الشاي — Tea
4. الزعفران — Saffron
5. مستلزمات الضيافة — Hospitality Supplies
6. أدوات القهوة والشاي — Coffee & Tea Tools
7. بوكس هدايا — Gift Boxes
8. خصومات أسبوعية — Weekly Deals

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| State / Cart | Zustand 5 |
| Font | Cairo (Google Fonts) |
| Images | Unsplash (via next/image) |
| Data | Mock JSON (no backend) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/ahmedaltyeb/Tamouri_website.git
cd Tamouri_website

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
Tamouri/
├── app/
│   ├── layout.tsx              # Root layout — RTL, Cairo font
│   ├── page.tsx                # Homepage
│   ├── shop/page.tsx           # Shop with search & filter
│   ├── product/[id]/page.tsx   # Single product page
│   ├── cart/page.tsx           # Shopping cart
│   ├── contact/page.tsx        # Contact form
│   └── globals.css             # Global styles + Tailwind
│
├── components/
│   ├── TopBar.tsx              # Delivery announcement bar
│   ├── Header.tsx              # Sticky nav — logo, search, cart, wishlist
│   ├── Hero.tsx                # Full-width hero banner
│   ├── CategoryCards.tsx       # Scrollable category row
│   ├── FeaturedProducts.tsx    # 4-column product grid
│   ├── ProductCard.tsx         # Reusable product card
│   ├── WhyTamouri.tsx          # Features + CTA banner
│   ├── Testimonials.tsx        # Customer reviews section
│   ├── Footer.tsx              # Footer with links, contact, payment icons
│   └── CartHydration.tsx       # Client-only cart persistence hydration
│
├── lib/
│   └── products.ts             # 12 mock products + 8 categories
│
├── store/
│   └── cartStore.ts            # Zustand cart & wishlist store (SSR-safe)
│
├── polyfill-storage.js         # Node.js localStorage polyfill (SSR fix)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `cream` | `#FAF8F5` | Page background |
| `brown` | `#8B5E3C` | Primary actions, logo |
| `gold` | `#C49A3C` | Accents, badges, CTA |
| `ink` | `#1A1A1A` | Body text |
| Font | Cairo 300–900 | All Arabic + Latin text |

---

## ⚙️ SSR Fix — localStorage Polyfill

Some environments (Electron, certain CI runners) inject a broken `--localstorage-file` global that causes `localStorage.getItem is not a function` in Node.js. The project handles this at two levels:

1. **`polyfill-storage.js`** — replaces the broken global with a working in-memory implementation before Next.js boots.
2. **`NODE_OPTIONS`** via `cross-env` — propagates the polyfill to every webpack worker process Next.js spawns.
3. **`cartStore.ts`** — all storage calls are guarded with `typeof window === "undefined"` + `try/catch`.

```json
"dev": "cross-env NODE_OPTIONS=\"--require ./polyfill-storage.js\" next dev"
```

---

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create optimised production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

---

## 🌐 Brand

| Field | Value |
|-------|-------|
| Store Name | تموري (Tamouri) |
| Tagline | متجر القهوة والشاي والتمور في الإمارات |
| Location | Dubai, UAE |
| Currency | AED (درهم) |
| Language | Arabic (primary) |

---

## 📃 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**TechSolutions Company**  
Built for the UAE market with ❤️
