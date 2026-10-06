import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: [".next/**", ".next-dev/**", ".next-verify/**", "plesk-release/**", "node_modules/**", "public/**", "drizzle/**", "next-env.d.ts", "knowledge-csv/**", ".venv/**"] },
  ...compat.extends("next/core-web-vitals"),
  {
    // Loaded so existing `eslint-disable @typescript-eslint/...` comments resolve; types are checked by tsc.
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      // Apostrophes and quotes in text are fine as written.
      "react/no-unescaped-entities": "off",
      // Download links to API routes are plain anchors on purpose.
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
];

export default config;
