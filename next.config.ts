import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['cdn2.suno.ai'],
  },
  output: 'standalone', // Optimizes for Docker deployment
};

export default nextConfig;
