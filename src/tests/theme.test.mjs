import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { findRawColours, RAW_COLOUR } from "../../scripts/check-theme.mjs";

test("theme: components use the semantic tokens, never raw palette shades", () => {
  assert.deepEqual(findRawColours(path.join(process.cwd(), "src")), [], "replace these with tokens from src/styles/tokens.css");
});

test("theme: the check recognises raw shades with variants and opacity, and leaves tokens alone", () => {
  const hits = (text) => [...text.matchAll(RAW_COLOUR)].map((match) => match[0]);
  assert.deepEqual(hits("hover:bg-amber-500/20 text-slate-300 md:border-l-emerald-400"), ["hover:bg-amber-500/20", "text-slate-300", "md:border-l-emerald-400"]);
  assert.deepEqual(hits("bg-gold-soft text-muted-foreground border-brand/30 bg-black/60 text-white"), []);
});

test("theme: every semantic colour a component can use is defined for light and dark", () => {
  const css = fs.readFileSync(path.join(process.cwd(), "src/styles/tokens.css"), "utf8");
  // The first rule whose selector list starts with `start` (the dark block also lists .theme-dark …).
  const block = (start) => {
    const at = css.indexOf(start);
    assert.ok(at >= 0, `${start} block in tokens.css`);
    return css.slice(at, css.indexOf("}", at));
  };
  const light = block(":root {");
  const dark = block("html.dark,\n");
  for (const hue of ["brand", "gold", "success", "warning", "danger", "info", "plum"]) {
    for (const part of ["", "-strong", "-soft", "-foreground"]) {
      const name = `--${hue}${part}:`;
      assert.ok(light.includes(name), `${name} in the light theme`);
      assert.ok(dark.includes(name), `${name} in the dark theme`);
    }
  }
  for (const name of ["--bg-primary:", "--bg-card:", "--text-primary:", "--text-muted:", "--text-dim:", "--border-subtle:"]) {
    assert.ok(light.includes(name) && dark.includes(name), `${name} in both themes`);
  }
});
