import type { NextConfig } from "next";

const campaignAssetCache = [
  {
    key: "Cache-Control",
    value: "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/memes/:path*", headers: campaignAssetCache },
      { source: "/meme-frames/:path*", headers: campaignAssetCache },
      { source: "/fonts/:path*", headers: campaignAssetCache },
      { source: "/:asset*.svg", headers: campaignAssetCache },
      { source: "/:asset*.png", headers: campaignAssetCache },
    ];
  },
};

export default nextConfig;
