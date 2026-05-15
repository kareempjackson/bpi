import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  // Note: Next 16's `experimental.viewTransition` integration requires
  // React canary (which exports `<ViewTransition>`). React 19.2.4 stable
  // does not, so the flag stays off until React ships ViewTransition in
  // a stable release.
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 requires non-75 qualities to be allowlisted up front.
    qualities: [50, 75, 90],
    // Sanity asset URLs are content-addressed (immutable per asset ID), so
    // cache them aggressively. 31 days.
    minimumCacheTTL: 2_678_400,
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1920, 2560],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
