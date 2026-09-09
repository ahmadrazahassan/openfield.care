import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 narrowed the default to [75]; any `quality` prop outside this
    // list is silently coerced to the nearest allowed value.
    qualities: [75, 82],
    // No remotePatterns: every image is a local generated asset under
    // /public. An external URL will fail to load rather than slip in.
  },
  experimental: {
    optimizePackageImports: ["motion", "lucide-react"],
  },
};

export default nextConfig;
