/**
 * InnieAI Blog Auto-Publisher Script
 * Run: npx tsx scripts/blog-publisher.ts
 * GitHub Action: blog-publisher.yml (Tuesday + Friday 7am PST)
 */

import { createScriptClient } from '../src/lib/supabase/server'
import { sendOwnerAlert } from '../src/lib/resend'
import { generateBlogPost } from '../src/lib/anthropic'

const NICHES = [
  'real estate',
  'dental',
  'med spa',
  'gym',
  'contractor',
  'law firm',
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function main() {
  const supabase = createScriptClient()

  // Pick niche based on day of year to alternate evenly
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const niche = NICHES[dayOfYear % NICHES.length]

  console.log(`Generating blog post for niche: ${niche}`)

  let postData: { title: string; content: string; metaDescription: string }
  try {
    postData = await generateBlogPost(niche)
  } catch (err) {
    throw new Error(`Failed to generate blog post: ${err instanceof Error ? err.message : String(err)}`)
  }

  const slug = slugify(postData.title)

  // Check for duplicate slug
  const { data: existing } = await supabase
    .from('posts')
    .select('id')
    .eq('slug', slug)
    .limit(1)

  const finalSlug = existing && existing.length > 0
    ? `${slug}-${Date.now()}`
    : slug

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      title: postData.title,
      slug: finalSlug,
      content: postData.content,
      niche,
      meta_description: postData.metaDescription,
      published: true,
      published_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save post: ${error.message}`)
  }

  console.log(`✓ Published: "${postData.title}" at /blog/${finalSlug}`)

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'
  await sendOwnerAlert(
    `📝 New Blog Post Published: ${postData.title}`,
    `A new blog post was auto-published.\n\nTitle: ${postData.title}\nNiche: ${niche}\nURL: ${baseUrl}/blog/${finalSlug}`
  )
}

main().catch(async (err) => {
  console.error('Blog publisher script failed:', err)
  await sendOwnerAlert(
    '⚠️ Blog Publisher Script Failed',
    `Error: ${err instanceof Error ? err.message : String(err)}`
  )
  process.exit(1)
})
