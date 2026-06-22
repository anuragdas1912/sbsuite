import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
  // Disable dev indicators by casting to any to bypass strict type checks in Next 16+
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  } as any,
};

export default withPWA(nextConfig);
