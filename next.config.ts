import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.forgecdn.net",
        pathname: "/avatars/**",
      },
    ],
  },
};

export default nextConfig;
