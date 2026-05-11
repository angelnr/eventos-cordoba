/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'localhost',
      },
      {
        hostname: 'eventoscordoba.xyz',
      },
    ],
  },
  transpilePackages: ['lucide-react', 'leaflet', 'react-leaflet'],
}

module.exports = nextConfig
