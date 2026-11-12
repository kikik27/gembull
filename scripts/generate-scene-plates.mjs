// Generates the vector scene plates used behind the landing page.
// Output is resolution-independent SVG, so it stays sharp at any viewport or pixel density.
// Usage: node scripts/generate-scene-plates.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "apps/web/public/brand/scene");
mkdirSync(outDir, { recursive: true });

const W = 1920;
const H = 1080;
const HORIZON = Math.round(H * 0.42);

let seed = 7;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

function plate({ night }) {
  seed = night ? 19 : 7;
  const ringOpacity = night ? 0.5 : 1;
  const starCount = night ? 230 : 110;
  const cx = Math.round(W * 0.62);
  const cy = Math.round(H * 0.545);

  const rings = Array.from({ length: 11 }, (_, i) => {
    const rx = 90 + i * i * 9 + i * 70;
    const ry = rx * 0.2;
    const o = (0.62 * Math.exp(-i * 0.3) * ringOpacity).toFixed(3);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="none" stroke="#B7FF16" stroke-opacity="${o}" stroke-width="${(1.6 - i * 0.07).toFixed(2)}"/>`;
  }).join("");

  const stars = Array.from({ length: starCount }, () => {
    const x = rand() * W;
    const y = rand() * (HORIZON - 30);
    const r = 0.5 + rand() * 1.1;
    const o = (0.18 + rand() * 0.5) * (night ? 1 : 0.75);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#F4F7F2" fill-opacity="${o.toFixed(2)}"/>`;
  }).join("");

  const columns = 46;
  const colW = W / columns;
  const candles = Array.from({ length: columns }, (_, i) => {
    const trend = 0.35 + 0.9 * (i / columns);
    const h = (14 + rand() * 120) * trend * (night ? 0.8 : 1);
    const x = i * colW + colW * 0.2;
    const w = colW * 0.6;
    const wick = h * 1.32;
    const o = ((0.1 + rand() * 0.12) * (night ? 0.8 : 1)).toFixed(3);
    return (
      `<rect x="${(i * colW + colW * 0.47).toFixed(1)}" y="${(HORIZON - wick).toFixed(1)}" width="2" height="${wick.toFixed(1)}" fill="#00B85A" fill-opacity="${o}"/>` +
      `<rect x="${x.toFixed(1)}" y="${(HORIZON - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="#00B85A" fill-opacity="${o}"/>`
    );
  }).join("");

  const sky = night ? ["#030504", "#060b07"] : ["#050806", "#0a150d"];
  const water = night ? ["#07110a", "#030504"] : ["#0d1c11", "#050806"];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${water[0]}"/><stop offset="1" stop-color="${water[1]}"/></linearGradient>
<radialGradient id="glow" cx="${cx}" cy="${cy}" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#B7FF16" stop-opacity="${night ? 0.1 : 0.18}"/><stop offset="1" stop-color="#B7FF16" stop-opacity="0"/></radialGradient>
<linearGradient id="horizon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00B85A" stop-opacity="0"/><stop offset="0.5" stop-color="#7DDB2E" stop-opacity="${night ? 0.28 : 0.5}"/><stop offset="1" stop-color="#00B85A" stop-opacity="0"/></linearGradient>
</defs>
<rect width="${W}" height="${HORIZON}" fill="url(#sky)"/>
<rect y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#water)"/>
${stars}
${candles}
<rect y="${HORIZON - 26}" width="${W}" height="52" fill="url(#horizon)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
${rings}
</svg>
`;
}

writeFileSync(resolve(outDir, "ritual-day.svg"), plate({ night: false }));
writeFileSync(resolve(outDir, "ritual-night.svg"), plate({ night: true }));
console.log("Wrote ritual-day.svg and ritual-night.svg to", outDir);
