/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. THIS IS THE FIX: Increase upload limit to 5MB
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },

  // 2. Keep your existing settings below
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ["*.theopenbuilder.com"],
};

export default nextConfig;
