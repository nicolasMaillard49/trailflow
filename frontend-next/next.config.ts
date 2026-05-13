import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF en priorité (≈25% plus léger que WebP) puis fallback WebP.
    // Le navigateur négocie via l'header Accept, donc aucun risque côté UA.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
