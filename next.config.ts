import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a verification build run beside a live `next dev` without sharing its .next folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  compress: process.env.NODE_ENV === "production",
  poweredByHeader: false,
  // The project is its own root, even when another lockfile sits in a parent folder.
  outputFileTracingRoot: process.cwd(),
  experimental: {
    // Pillar 2 P8: Eliminate unused SVG symbols from Lucide (~150KB saved)
    optimizePackageImports: ["lucide-react", "echarts-for-react", "echarts"],
  },
  // Pillar 2 P5: Keep heavy server-only node modules out of the client bundle
  serverExternalPackages: ["node-cron", "postgres"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self)" },
          // Browsers that have reached the site over HTTPS keep using HTTPS (ignored on plain HTTP).
          ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=15552000" }] : []),
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://telegram.org https://translate.google.com https://translate.googleapis.com; frame-src https://oauth.telegram.org https://translate.google.com https://translate.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://translate.google.com https://translate.googleapis.com; img-src 'self' data: blob: https:; media-src 'self' blob:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' http: https:; frame-ancestors 'self'; base-uri 'self'; object-src 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
