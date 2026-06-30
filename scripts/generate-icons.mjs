/**
 * Generates all favicon and PWA icon variants from public/favicon.svg
 * Uses sharp (bundled with Next.js — no extra install needed).
 *
 * Run from project root:
 *   node scripts/generate-icons.mjs
 *
 * Outputs:
 *   public/favicon.ico          (multi-size: 16, 32, 48)
 *   public/apple-touch-icon.png (180×180)
 *   public/icon-192.png         (192×192)
 *   public/icon-512.png         (512×512)
 */

import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Resolve sharp from Next.js's bundled copy (avoids version mismatch)
const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require("sharp");
} catch {
  // Try Next.js bundled sharp path
  sharp = require(join(root, "node_modules", "sharp"));
}

const SRC = join(root, "public", "favicon.svg");
const svgBuffer = readFileSync(SRC);

async function png(size, outFile) {
  const dest = join(root, "public", outFile);
  await sharp(svgBuffer, { density: 300 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(dest);
  console.log(`✓ ${outFile} (${size}×${size})`);
}

/**
 * Build a minimal ICO file containing 16×16, 32×32 and 48×48 PNG frames.
 * The ICO format is: 6-byte header + N×16-byte directory entries + PNG data.
 */
async function ico(sizes, outFile) {
  const dest = join(root, "public", outFile);

  // Generate PNG buffers for each size
  const frames = await Promise.all(
    sizes.map(async (size) => {
      const data = await sharp(svgBuffer, { density: 300 })
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 6 })
        .toBuffer();
      return { size, data };
    }),
  );

  const headerSize  = 6;
  const entrySize   = 16;
  const dirSize     = frames.length * entrySize;
  const dataOffset  = headerSize + dirSize;
  const totalSize   = dataOffset + frames.reduce((s, f) => s + f.data.length, 0);

  const buf = Buffer.alloc(totalSize);

  // ICO header (6 bytes)
  buf.writeUInt16LE(0, 0);            // reserved
  buf.writeUInt16LE(1, 2);            // type: 1 = ICO
  buf.writeUInt16LE(frames.length, 4);// image count

  let dataPos = dataOffset;
  frames.forEach(({ size, data }, i) => {
    const entry = headerSize + i * entrySize;
    buf.writeUInt8(size >= 256 ? 0 : size, entry + 0);  // width  (0 = 256)
    buf.writeUInt8(size >= 256 ? 0 : size, entry + 1);  // height (0 = 256)
    buf.writeUInt8(0, entry + 2);     // color count (0 = no palette)
    buf.writeUInt8(0, entry + 3);     // reserved
    buf.writeUInt16LE(1, entry + 4);  // color planes
    buf.writeUInt16LE(32, entry + 6); // bits per pixel
    buf.writeUInt32LE(data.length, entry + 8);   // data size
    buf.writeUInt32LE(dataPos, entry + 12);       // data offset

    data.copy(buf, dataPos);
    dataPos += data.length;
  });

  writeFileSync(dest, buf);
  console.log(`✓ ${outFile} (${sizes.join(", ")}px)`);
}

// ── Run ──────────────────────────────────────────────────────────────────────
console.log("Generating icons from public/favicon.svg …\n");

await ico([16, 32, 48], "favicon.ico");
await png(180,  "apple-touch-icon.png");
await png(192,  "icon-192.png");
await png(512,  "icon-512.png");

console.log("\nAll icons generated successfully.");
