import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://innieai.co'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/portal/', '/onboard/', '/setup/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
