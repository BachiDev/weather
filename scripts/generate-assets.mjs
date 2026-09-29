// Generates public/og-cover.png (1200x630) and public/icon-512.png.
// Run from the repo root: node scripts/generate-assets.mjs (requires sharp).
//
// Brand source of truth: public/icon-192.png is the FB monogram copied from
// bachi.dev (public/android-chrome-192x192.png) — committed, never generated.
// public/icon-512.png is upscaled from it for the PWA manifest.
import sharp from "sharp";

const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="25%" cy="30%" r="55%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#09090b" />
  <rect width="1200" height="630" fill="url(#glow)" />
  <rect x="96" y="150" width="10" height="330" rx="5" fill="#8b5cf6" />
  <text x="140" y="290" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="bold" fill="#ffffff">Weather Dashboard</text>
  <text x="140" y="365" font-family="Arial, Helvetica, sans-serif" font-size="44" fill="#a78bfa">7-day outlook · 24-hour forecast</text>
  <text x="140" y="425" font-family="Consolas, monospace" font-size="32" fill="#a1a1aa">Next.js · Open-Meteo · bachi.dev</text>
</svg>`;

await sharp(Buffer.from(OG_SVG)).png().toFile("public/og-cover.png");
console.log("public/og-cover.png written");

await sharp("public/icon-192.png")
  .resize(512, 512)
  .png()
  .toFile("public/icon-512.png");
console.log("public/icon-512.png written (upscaled FB monogram)");
