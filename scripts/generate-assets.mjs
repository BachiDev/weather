// Generates public/og-cover.png (1200x630), public/icon-192.png and
// public/icon-512.png from inline SVG (no design tools needed).
// Run from the repo root: node scripts/generate-assets.mjs (requires sharp).
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
  <circle cx="990" cy="180" r="70" fill="none" stroke="#a78bfa" stroke-width="14" />
  <g stroke="#a78bfa" stroke-width="14" stroke-linecap="round">
    <line x1="990" y1="60" x2="990" y2="30" />
    <line x1="990" y1="300" x2="990" y2="330" />
    <line x1="870" y1="180" x2="840" y2="180" />
    <line x1="1110" y1="180" x2="1140" y2="180" />
    <line x1="905" y1="95" x2="884" y2="74" />
    <line x1="1075" y1="265" x2="1096" y2="286" />
    <line x1="1075" y1="95" x2="1096" y2="74" />
    <line x1="905" y1="265" x2="884" y2="286" />
  </g>
  <text x="140" y="290" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="bold" fill="#ffffff">Weather Dashboard</text>
  <text x="140" y="365" font-family="Arial, Helvetica, sans-serif" font-size="44" fill="#a78bfa">7-day outlook · 24-hour forecast</text>
  <text x="140" y="425" font-family="Consolas, monospace" font-size="32" fill="#a1a1aa">Next.js · Open-Meteo · bachi.dev</text>
</svg>`;

const iconSvg = (
  size,
) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#6d28d9" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  <circle cx="256" cy="216" r="72" fill="none" stroke="#ffffff" stroke-width="30" />
  <g stroke="#ffffff" stroke-width="30" stroke-linecap="round">
    <line x1="256" y1="84" x2="256" y2="48" />
    <line x1="256" y1="348" x2="256" y2="384" />
    <line x1="124" y1="216" x2="88" y2="216" />
    <line x1="388" y1="216" x2="424" y2="216" />
    <line x1="163" y1="123" x2="137" y2="97" />
    <line x1="349" y1="309" x2="375" y2="335" />
    <line x1="349" y1="123" x2="375" y2="97" />
    <line x1="163" y1="309" x2="137" y2="335" />
  </g>
  <rect x="106" y="392" width="300" height="26" rx="13" fill="#ffffff" opacity="0.85" />
</svg>`;

await sharp(Buffer.from(OG_SVG)).png().toFile("public/og-cover.png");
console.log("public/og-cover.png written");

await sharp(Buffer.from(iconSvg(192)))
  .png()
  .toFile("public/icon-192.png");
await sharp(Buffer.from(iconSvg(512)))
  .png()
  .toFile("public/icon-512.png");
console.log("public/icon-192.png + public/icon-512.png written");
