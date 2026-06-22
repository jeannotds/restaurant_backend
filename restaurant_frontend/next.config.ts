import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "172.20.10.5",
    "172.20.10.8",
  ],
};

export default nextConfig;
