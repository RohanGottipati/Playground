import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Source photos are served from Supabase Storage (or /api/images locally).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  eslint: {
    dirs: ["app", "components", "game", "lib"],
  },
};

export default nextConfig;
