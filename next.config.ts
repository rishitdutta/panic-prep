import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/pngs/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/pngs/**",
      },
      {
        protocol: "https",
        hostname: "panic-prep-backend.onrender.com",
        pathname: "/pngs/**",
      },
    ],
  },
};

export default nextConfig;
