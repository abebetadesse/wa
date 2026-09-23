/**
 * Rewrites hard-coded colours in a stylesheet to the nearest design token, keeping alpha with
 * color-mix(), so legacy component CSS follows the light / dark / high-contrast themes.
 * Shadow colours are left alone.
 *
 *   node scripts/tokenize-colors.mjs src/styles/globals.css [--dry]
 */
import fs from "node:fs";

const file = process.argv[2];
const dry = process.argv.includes("--dry");

// Anchor colours from the legacy palettes, grouped by the token that now owns that role.
const ANCHORS = {
  "--brand-accent": ["#0284c7", "#38bdf8", "#7dd3fc", "#00f0ff", "#0080ff", "#0ea5e9", "#22d3ee", "#06b6d4", "#8bd1b7", "#b7d7a8"],
  "--brand-primary": ["#075985", "#0369a1", "#0c4d6f", "#1f6c4d", "#2d7f5a", "#4a8d67"],
  "--cultural-gold": ["#e5a93c", "#d9a54e", "#f4c76b", "#ffb000", "#f59e0b", "#fbbf24", "#d8a746", "#c58d2d", "#f1c86d", "#dfb65e", "#d99522", "#a86e12", "#fcd34d", "#d6d79c"],
  "--status-danger": ["#e11d48", "#be123c", "#ff00aa", "#9b3033", "#a83c2f", "#b55746", "#d88d7f", "#ef4444", "#f43f5e"],
  "--status-success": ["#10b981", "#34d399", "#22c55e"],
  "--text-primary": ["#2a211d", "#3d291f", "#4d3d34", "#7a3d2c", "#16324f", "#f8fafc", "#e2e8f0", "#ffffff", "#f7efe6"],
  "--text-muted": ["#735f52", "#8f7a6a", "#94a3b8", "#58738a", "#64748b", "#475569"],
  "--bg-primary": ["#f7f0e4", "#f6eee2", "#efe0c7", "#f5faff", "#06131f", "#000000", "#020617", "#0b0f14"],
  "--bg-card": ["#071018", "#0d2233", "#12304a", "#0f172a", "#1e293b", "#352316", "#4c3120", "#361f18", "#484022"],
};

const hexToRgb = (hex) => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const anchors = Object.entries(ANCHORS).flatMap(([token, list]) => list.map((hex) => ({ token, rgb: hexToRgb(hex) })));

function nearest(rgb) {
  let best = anchors[0];
  let bestDistance = Infinity;
  for (const anchor of anchors) {
    const d = anchor.rgb.reduce((sum, v, i) => sum + (v - rgb[i]) ** 2, 0);
    if (d < bestDistance) [best, bestDistance] = [anchor, d];
  }
  return best.token;
}

/** White/black at low alpha are theme overlays: tint with the text colour so they flip per theme. */
function tokenFor(rgb, alpha) {
  const [r, g, b] = rgb;
  const isWhite = r > 245 && g > 245 && b > 245;
  const isBlack = r < 12 && g < 12 && b < 12;
  if (isWhite && alpha <= 0.3) return "--text-primary";
  if (isBlack && alpha <= 0.3) return "--text-primary";
  if (isBlack) return "--bg-primary";
  return nearest(rgb);
}

const toCss = (token, alpha) =>
  alpha >= 0.999 ? `var(${token})` : `color-mix(in srgb, var(${token}) ${Math.round(alpha * 1000) / 10}%, transparent)`;

const SKIP_PROPS = /^(box-shadow|text-shadow|filter|-webkit-filter|--shadow|--glow)/;
let replaced = 0;

const out = fs
  .readFileSync(file, "utf8")
  .split("\n")
  .map((line) => {
    const prop = line.trim().split(":")[0];
    if (SKIP_PROPS.test(prop) || line.includes("drop-shadow")) return line;
    // Custom properties defining legacy aliases are left for the token file to own.
    if (/^\s*--[\w-]+\s*:/.test(line) && !/gradient|url\(/.test(line)) return line;
    return line
      .replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/g, (_m, r, g, b, a) => {
        replaced++;
        const alpha = a === undefined ? 1 : Number(a);
        return toCss(tokenFor([+r, +g, +b], alpha), alpha);
      })
      .replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?![\w-])/g, (m) => {
        replaced++;
        return toCss(tokenFor(hexToRgb(m), 1), 1);
      });
  })
  .join("\n");

if (!dry) fs.writeFileSync(file, out);
console.log(`${dry ? "would replace" : "replaced"} ${replaced} colour literals in ${file}`);
