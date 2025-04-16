/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn2.suno.ai'],
  },
  output: 'standalone', // Optimizes for Docker deployment
}

module.exports = nextConfig
