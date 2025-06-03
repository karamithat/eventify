import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      // Diğer domain'ler...
    ],
  },
};

export default nextConfig;
