import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
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
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' http: https:; frame-ancestors 'self'; base-uri 'self'; object-src 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

