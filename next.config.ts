import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
    ];
  },
};

export default nextConfig;
