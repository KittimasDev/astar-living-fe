/** @type {import('next').NextConfig} */
const packageJson = require("./package.json");

const nextConfig = {
  output: "standalone",

  devIndicators: false,
  reactStrictMode: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  env: {
    NEXT_PUBLIC_WEB_BASE_URL: process.env.NEXT_PUBLIC_WEB_BASE_URL,
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },

  async rewrites() {
    const apiTarget =
      process.env.API_REWRITE_TARGET ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080";

    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
