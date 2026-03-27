import type { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://innieai.co'

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/partners`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/for/real-estate`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/for/dental`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/for/medspa`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/for/gyms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/for/contractors`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ]

  try {
    const supabase = createServerClient()
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, published_at')
      .eq('published', true)

    const blogRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.published_at ?? new Date()),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...blogRoutes]
  } catch {
    return staticRoutes
  }
}
