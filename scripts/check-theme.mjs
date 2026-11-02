/**
 * Fails when a component uses a raw Tailwind palette colour (text-slate-300, bg-amber-950 …).
 *
 * Colours come from the semantic tokens in src/styles/tokens.css (bg-card, text-muted-foreground,
 * bg-gold-soft, text-brand-foreground …), so every page follows the light, dark and high-contrast
 * themes. White and black stay allowed for overlays on photos and video.
 *
 *   node scripts/check-theme.mjs        (npm run theme:check)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FAMILIES = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const PROPS = "bg|text|border(?:-[trblxyse])?|from|via|to|ring|ring-offset|divide|outline|decoration|fill|stroke|shadow|placeholder|caret|accent";
export const RAW_COLOUR = new RegExp(String.raw`(?<![\w-])(?:[\w\-\[\]&>*@.()=%#,/]+?:)*(?:${PROPS})-(?:${FAMILIES})-\d{2,3}(?:\/[\d.\[\]%]+)?(?![\w-])`, "g");

/** Every raw palette class under `root`, as "file:line class". */
export function findRawColours(root) {
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "tests" && entry.name !== "node_modules") walk(full);
      } else if (/\.(tsx|ts)$/.test(entry.name)) {
        fs.readFileSync(full, "utf8").split("\n").forEach((line, index) => {
          for (const match of line.matchAll(RAW_COLOUR)) found.push(`${path.relative(process.cwd(), full)}:${index + 1} ${match[0]}`);
        });
      }
    }
  };
  walk(root);
  return found;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const found = findRawColours(path.join(process.cwd(), "src"));
  if (found.length) {
    console.error(`${found.length} raw palette colour${found.length === 1 ? "" : "s"}; use the semantic tokens in src/styles/tokens.css instead:\n${found.slice(0, 50).join("\n")}`);
    process.exit(1);
  }
  console.log("Theme check passed: no raw palette colours.");
}
