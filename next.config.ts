import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        source: "/(llms\\.txt|llms-full\\.txt|sitemap\\.xml|robots\\.txt)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
          },
          { key: "X-Robots-Tag", value: "all" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/pwa-icon/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/calculus",
        destination: "/multivariable-calculus",
        permanent: true,
      },
      {
        source: "/calculus/:slug",
        destination: "/multivariable-calculus/integral-calculus/:slug",
        permanent: true,
      },
      {
        source: "/multivariable-calculus/multiple-integrals",
        destination: "/multivariable-calculus/integral-calculus",
        permanent: true,
      },
      {
        source: "/multivariable-calculus/multiple-integrals/:slug",
        destination: "/multivariable-calculus/integral-calculus/:slug",
        permanent: true,
      },
      {
        source: "/multivariable-calculus/multivariable-differentiation",
        destination: "/multivariable-calculus/differential-calculus",
        permanent: true,
      },
      {
        source: "/multivariable-calculus/multivariable-differentiation/:slug",
        destination: "/multivariable-calculus/differential-calculus/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
