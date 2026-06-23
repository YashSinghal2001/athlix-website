// Optimize before/after transformation pairs to web-sized WebP.
// Run: node scripts/optimize-beforeafter.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assets = path.resolve(__dirname, "../src/assets");

const WIDTH = 760;
const QUALITY = 80;

// Auto-detect every 2_N_before.png / 2_N_after.png pair.
const files = fs.readdirSync(assets);
const ids = [...new Set(
  files
    .map((f) => f.match(/^2_(\d+)_(before|after)\.png$/i))
    .filter(Boolean)
    .map((m) => Number(m[1]))
)].sort((a, b) => a - b);

let saved = 0;
for (const id of ids) {
  for (const side of ["before", "after"]) {
    const input = path.join(assets, `2_${id}_${side}.png`);
    if (!fs.existsSync(input)) { console.warn("missing:", `2_${id}_${side}.png`); continue; }
    const out = path.join(assets, `2_${id}_${side}.webp`);
    const before = fs.statSync(input).size;
    await sharp(input).rotate().resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 5 }).toFile(out);
    saved += before - fs.statSync(out).size;
  }
  console.log(`pair 2_${id}: optimized`);
}
console.log(`\nPairs: ${ids.length} (ids ${ids.join(", ")})`);
console.log(`Total saved: ${(saved / 1e6).toFixed(1)} MB`);
