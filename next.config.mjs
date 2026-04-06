/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: '/dashboard', destination: '/found', permanent: true }]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
