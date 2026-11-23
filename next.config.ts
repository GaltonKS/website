import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Forecast Engine page moved from /forecast to the home page.
  async redirects() {
    return [{ source: "/forecast", destination: "/", permanent: false }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
