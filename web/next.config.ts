import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  fallbacks: {
    document: "/~offline"
  },
  workboxOptions: {
    skipWaiting: true
  }
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["firebase-admin"],
  webpack(config) {
    config.cache = false;
    return config;
  }
};

export default withPWA(nextConfig);
