import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images: {
    domains: ["localhost"],
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
