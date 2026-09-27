import type { NextConfig } from "next";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "https://ajo-api-p1xw.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/auth/:path*", destination: `${API}/auth/:path*` },
      { source: "/api-proxy/:path*", destination: `${API}/:path*` },
    ];
  },
};

export default nextConfig;
