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
        destination: "/multivariable-calculus/multiple-integrals/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
