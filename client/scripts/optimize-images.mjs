// One-off image optimization: convert oversized PNG photos to web-sized WebP.
// Run: node scripts/optimize-images.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assets = path.resolve(__dirname, "../src/assets");

// [file, targetWidth, quality]
const photos = [
  ["1.png", 1200, 80],      // hero
  ["1_14.png", 1100, 80],   // coach
  ["4_1.png", 480, 78],     // review/testimonial
  ["4_2.png", 480, 78],
  ["4_3.png", 480, 78],
];
for (let i = 1; i <= 15; i++) photos.push([`2_${i}.png`, 900, 78]); // transformations

let savedBytes = 0;
for (const [file, width, quality] of photos) {
  const input = path.join(assets, file);
  if (!fs.existsSync(input)) { console.warn("skip (missing):", file); continue; }
  const out = path.join(assets, file.replace(/\.png$/, ".webp"));
  const before = fs.statSync(input).size;
  await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(out);
  const after = fs.statSync(out).size;
  savedBytes += before - after;
  console.log(
    `${file.padEnd(10)} ${(before / 1e6).toFixed(2)}MB -> ${(after / 1e3).toFixed(0)}KB  ${path.basename(out)}`
  );
}

// Recompress the one heavy logo (keep alpha -> stay PNG-with-alpha as webp).
const heavyLogo = path.join(assets, "certs/team-boss.png");
if (fs.existsSync(heavyLogo)) {
  const before = fs.statSync(heavyLogo).size;
  const out = path.join(assets, "certs/team-boss.webp");
  await sharp(heavyLogo).resize({ width: 320, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  const after = fs.statSync(out).size;
  savedBytes += before - after;
  console.log(`team-boss  ${(before / 1e3).toFixed(0)}KB -> ${(after / 1e3).toFixed(0)}KB  team-boss.webp`);
}

console.log(`\nTotal saved: ${(savedBytes / 1e6).toFixed(1)} MB`);
