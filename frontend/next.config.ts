import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for Docker/Render; Vercel automatically handles serverless deployments
  output: process.env.VERCEL ? undefined : "standalone",
  reactStrictMode: true,
};

export default nextConfig;
