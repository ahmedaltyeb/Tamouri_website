/**
 * Generates public/og-image.png (1200×630) from an inline SVG definition.
 * Uses sharp (bundled with Next.js). Run: node scripts/generate-og.mjs
 *
 * Why a static file in addition to app/opengraph-image.tsx?
 * - WhatsApp and some crawlers only fetch static asset URLs, not dynamic routes
 * - Product page fallback and layout explicitly reference /og-image.png
 * - Static PNG loads instantly (no cold-start latency)
 */

import { createRequire } from "module";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const require = createRequire(import.meta.url);
const sharp = require(join(root, "node_modules", "sharp"));

// Brand colours
const GOLD       = "#C49A3C";
const GOLD_LIGHT = "#D4AE5C";
const GOLD_PALE  = "#F5D98A";
const BROWN      = "#8B5E3C";
const BROWN_DARK = "#6B4423";
const CREAM      = "#FAF8F5";
const CREAM_DARK = "#F0EBE3";

// 1200 × 630 OG image — split-panel layout
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" shape-rendering="geometricPrecision">
  <defs>
    <linearGradient id="leftBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${BROWN_DARK}"/>
      <stop offset="50%"  stop-color="${BROWN}"/>
      <stop offset="100%" stop-color="${GOLD}"/>
    </linearGradient>
    <linearGradient id="palmGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${GOLD_PALE}"/>
      <stop offset="100%" stop-color="${GOLD_LIGHT}"/>
    </linearGradient>
    <linearGradient id="divider" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="transparent"/>
      <stop offset="30%"  stop-color="${GOLD_LIGHT}"/>
      <stop offset="70%"  stop-color="${GOLD_LIGHT}"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${GOLD}"/>
      <stop offset="100%" stop-color="${GOLD_LIGHT}"/>
    </linearGradient>
  </defs>

  <!-- Cream background -->
  <rect width="1200" height="630" fill="${CREAM}"/>

  <!-- Left gradient panel -->
  <rect x="0" y="0" width="500" height="630" fill="url(#leftBg)"/>

  <!-- Decorative circles on left panel -->
  <circle cx="-40" cy="-40" r="200" fill="none" stroke="${GOLD_LIGHT}" stroke-width="2" opacity="0.18"/>
  <circle cx="500" cy="680" r="180" fill="none" stroke="${GOLD_LIGHT}" stroke-width="2" opacity="0.13"/>

  <!-- Logo box on left panel -->
  <rect x="185" y="90" width="130" height="130" rx="28" fill="${BROWN}" opacity="0.55"/>
  <rect x="183" y="88" width="130" height="130" rx="28"
        fill="none" stroke="${GOLD_PALE}" stroke-width="2.5" opacity="0.7"/>

  <!-- Palm icon inside logo box (scaled to fit 130×130 box at 185,88) -->
  <!-- Original palm viewBox 0 0 512 512 → scale 130/512 = 0.254, offset (185,88) -->
  <g transform="translate(185,88) scale(0.254)">
    <path d="M237 480 L275 480 L268 248 L244 248 Z" fill="url(#palmGrad)"/>
    <ellipse cx="256" cy="248" rx="28" ry="16" fill="url(#palmGrad)"/>
    <path d="M256 248 C252 210 248 180 244 132 C248 150 254 175 256 248Z" fill="url(#palmGrad)"/>
    <path d="M256 248 C260 210 264 180 268 132 C264 150 258 175 256 248Z" fill="url(#palmGrad)" opacity="0.85"/>
    <path d="M248 242 C230 208 210 185 172 152 C196 172 220 198 248 242Z" fill="url(#palmGrad)"/>
    <path d="M264 242 C282 208 302 185 340 152 C316 172 292 198 264 242Z" fill="url(#palmGrad)"/>
    <path d="M244 250 C218 228 194 216 148 208 C174 214 208 228 244 250Z" fill="url(#palmGrad)"/>
    <path d="M268 250 C294 228 318 216 364 208 C338 214 304 228 268 250Z" fill="url(#palmGrad)"/>
    <path d="M244 256 C214 254 186 264 148 288 C176 270 214 260 244 256Z" fill="url(#palmGrad)" opacity="0.8"/>
    <path d="M268 256 C298 254 326 264 364 288 C336 270 298 260 268 256Z" fill="url(#palmGrad)" opacity="0.8"/>
    <ellipse cx="188" cy="215" rx="14" ry="10" fill="${GOLD}"/>
    <ellipse cx="324" cy="215" rx="14" ry="10" fill="${GOLD}"/>
    <ellipse cx="216" cy="170" rx="12" ry="8"  fill="${GOLD}"/>
    <ellipse cx="296" cy="170" rx="12" ry="8"  fill="${GOLD}"/>
  </g>

  <!-- Arabic brand name -->
  <text x="250" y="268"
        text-anchor="middle"
        font-size="44" font-weight="bold"
        font-family="'Arabic Typesetting','Traditional Arabic','Geeza Pro','Arial Unicode MS',serif"
        fill="${GOLD_PALE}"
        direction="rtl">مربع الغربية</text>

  <!-- Gold rule -->
  <rect x="195" y="284" width="110" height="2" rx="1" fill="url(#accent)" opacity="0.7"/>

  <!-- Arabic tagline -->
  <text x="250" y="318"
        text-anchor="middle"
        font-size="22" font-weight="normal"
        font-family="'Arabic Typesetting','Traditional Arabic','Geeza Pro','Arial Unicode MS',serif"
        fill="${GOLD_LIGHT}"
        direction="rtl" opacity="0.9">للتمور والقهوة العربية</text>

  <!-- UAE label -->
  <text x="250" y="365"
        text-anchor="middle"
        font-size="14" font-weight="bold"
        font-family="'Segoe UI',Arial,sans-serif"
        fill="${GOLD_LIGHT}"
        letter-spacing="4" opacity="0.7">UAE  •  أبوظبي</text>

  <!-- Vertical gold divider -->
  <rect x="499" y="40" width="2" height="550" fill="url(#divider)" opacity="0.5"/>

  <!-- Right panel content -->
  <!-- Corner accent -->
  <polygon points="1200,0 1080,0 1200,120" fill="${GOLD}" opacity="0.07"/>
  <polygon points="500,630 620,630 500,510"  fill="${BROWN}" opacity="0.05"/>

  <!-- Gold dot + location label -->
  <circle cx="558" cy="108" r="5" fill="${GOLD}"/>
  <text x="572" y="114"
        font-size="13" font-weight="bold"
        font-family="'Segoe UI',Arial,sans-serif"
        fill="${GOLD}" letter-spacing="3">UAE  ·  PREMIUM QUALITY</text>

  <!-- Main headline -->
  <text x="558" y="192"
        font-size="58" font-weight="bold"
        font-family="'Segoe UI','Georgia',Arial,sans-serif"
        fill="${BROWN_DARK}">Premium UAE</text>
  <text x="558" y="260"
        font-size="58" font-weight="bold"
        font-family="'Segoe UI','Georgia',Arial,sans-serif"
        fill="${BROWN_DARK}">Dates &amp; Coffee</text>

  <!-- Gold accent bar -->
  <rect x="558" y="278" width="72" height="4" rx="2" fill="url(#accent)"/>

  <!-- Description text -->
  <text x="558" y="322"
        font-size="20"
        font-family="'Segoe UI',Arial,sans-serif"
        fill="#5C4A38">Authentic Emirati hospitality gifts —</text>
  <text x="558" y="350"
        font-size="20"
        font-family="'Segoe UI',Arial,sans-serif"
        fill="#5C4A38">dates, saffron, Arabic coffee &amp; tea.</text>
  <text x="558" y="378"
        font-size="20"
        font-family="'Segoe UI',Arial,sans-serif"
        fill="#5C4A38">Delivered across the UAE within 24h.</text>

  <!-- Feature pills -->
  <!-- Pill 1 -->
  <rect x="558" y="410" width="152" height="38" rx="19"
        fill="${GOLD}" opacity="0.14"/>
  <rect x="558" y="410" width="152" height="38" rx="19"
        fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.4"/>
  <text x="634" y="434"
        text-anchor="middle"
        font-size="14" font-weight="bold"
        font-family="'Segoe UI',Arial,sans-serif"
        fill="${BROWN}">Premium Dates</text>

  <!-- Pill 2 -->
  <rect x="722" y="410" width="158" height="38" rx="19"
        fill="${GOLD}" opacity="0.14"/>
  <rect x="722" y="410" width="158" height="38" rx="19"
        fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.4"/>
  <text x="801" y="434"
        text-anchor="middle"
        font-size="14" font-weight="bold"
        font-family="'Segoe UI',Arial,sans-serif"
        fill="${BROWN}">Arabic Coffee</text>

  <!-- Pill 3 -->
  <rect x="892" y="410" width="152" height="38" rx="19"
        fill="${GOLD}" opacity="0.14"/>
  <rect x="892" y="410" width="152" height="38" rx="19"
        fill="none" stroke="${GOLD}" stroke-width="1.5" opacity="0.4"/>
  <text x="968" y="434"
        text-anchor="middle"
        font-size="14" font-weight="bold"
        font-family="'Segoe UI',Arial,sans-serif"
        fill="${BROWN}">Free Delivery</text>

  <!-- Bottom rule + domain -->
  <rect x="558" y="488" width="600" height="1" fill="${GOLD}" opacity="0.2"/>
  <text x="1158" y="520"
        text-anchor="end"
        font-size="14" font-weight="bold"
        font-family="'Segoe UI',Arial,sans-serif"
        fill="${GOLD}" opacity="0.55">marbeaalgharbeya.ae</text>
</svg>`;

const dest = join(root, "public", "og-image.png");
await sharp(Buffer.from(SVG))
  .resize(1200, 630, { fit: "fill" })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(dest);

console.log("✓ public/og-image.png (1200×630)");
