/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
      },
      {
        hostname: 'api.eventoscordoba.xyz',
      },
    ],
  },
}

module.exports = nextConfig
