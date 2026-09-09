import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],

    // Next 16 narrowed the default to [75] and silently coerces anything else
    // to the nearest allowed value. These mirror IMAGE_QUALITY in
    // src/content/assets.ts — keep the two in step.
    qualities: [75, 86, 90, 92],

    // Explicit rather than inherited: the defaults changed in Next 16, and the
    // top end matters for full-bleed heroes on high-DPI displays.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // No remotePatterns: every image is a local generated asset under
    // /public. An external URL will fail to load rather than slip in.
  },
  experimental: {
    optimizePackageImports: ["motion", "lucide-react"],
  },
};

export default nextConfig;
