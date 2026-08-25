import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/our-work",
        destination: "/portfolio",
        permanent: false,
      },
      {
        source: "/our-work/:path*",
        destination: "/portfolio/:path*",
        permanent: false,
      },
      {
        source: "/verify-certificate",
        destination: "/verify",
        permanent: false,
      },
      {
        source: "/verify-certificate/:path*",
        destination: "/verify/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
