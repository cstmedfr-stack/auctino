import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "ydywpdtsknidsihaketh.supabase.co",
        pathname:
          "/storage/v1/object/public/product-images/**",
      },
      {
        protocol: "https",
        hostname:
          "ydywpdtsknidsihaketh.supabase.co",
        pathname:
          "/storage/v1/object/public/avatars/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/cont",
        destination: "/profile",
        permanent: true,
      },
      {
        source: "/licitatii",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/edit-profile",
        destination: "/account/profile",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;