import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/company",
        destination: "/about",
        permanent: false,
      },
      {
        source: "/company/:path*",
        destination: "/about/:path*",
        permanent: false,
      },
      {
        source: "/our-work",
        destination: "/services",
        permanent: false,
      },
      {
        source: "/our-work/:path*",
        destination: "/services/:path*",
        permanent: false,
      },
      {
        source: "/blog",
        destination: "/about",
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
