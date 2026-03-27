import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['maps.googleapis.com', 'lh3.googleusercontent.com'],
  },
  async headers() {
    return [
      {
        source: '/api/webhooks/:path*',
        headers: [{ key: 'x-webhook-handler', value: 'true' }],
      },
    ]
  },
}

export default nextConfig
