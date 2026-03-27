/**
 * InnieAI Lead Generation Script
 * Run: npx tsx scripts/lead-gen.ts
 * GitHub Action: daily-lead-gen.yml (7am PST daily)
 */

import { createScriptClient } from '../src/lib/supabase/server'
import { searchPlaces, getPlaceDetails, scoreLead } from '../src/lib/google-places'

/** Try to extract a business email from their website homepage */
async function extractEmailFromWebsite(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InnieAI/1.0)' },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const html = await res.text()
    // Match email addresses, skip common no-reply/privacy patterns
    const matches = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) ?? []
    const filtered = matches.filter((e) =>
      !e.includes('example.') &&
      !e.startsWith('no-reply') &&
      !e.startsWith('noreply') &&
      !e.startsWith('donotreply') &&
      !e.includes('sentry.io') &&
      !e.includes('w3.org') &&
      !e.includes('schema.org') &&
      !e.endsWith('.png') &&
      !e.endsWith('.jpg')
    )
    return filtered[0] ?? null
  } catch {
    return null
  }
}

// ==================== CONFIGURATION ====================
const TARGET_NICHES: { query: string; tag: string }[] = [
  { query: 'real estate agent', tag: 'real-estate' },
  { query: 'dental office', tag: 'dental' },
  { query: 'medical spa', tag: 'medspa' },
  { query: 'gym fitness studio', tag: 'gym' },
  { query: 'general contractor', tag: 'contractor' },
  { query: 'law firm', tag: 'law' },
]

const TARGET_CITIES = [
  'San Diego, CA',
  'Los Angeles, CA',
  'Phoenix, AZ',
  'Las Vegas, NV',
  'Denver, CO',
]

const MAX_PER_RUN = 100 // safety cap
// =======================================================

async function sendFailureAlert(error: string) {
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) return

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: ownerEmail,
      subject: '⚠️ InnieAI Lead Gen Script Failed',
      text: `The daily lead generation script failed.\n\nError:\n${error}\n\nTimestamp: ${new Date().toISOString()}`,
    })
  } catch (e) {
    console.error('Failed to send alert email:', e)
  }
}

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY is required')

  const supabase = createScriptClient()
  let totalInserted = 0
  let totalSkipped = 0

  for (const city of TARGET_CITIES) {
    for (const niche of TARGET_NICHES) {
      if (totalInserted >= MAX_PER_RUN) break

      console.log(`Searching: ${niche.query} in ${city}...`)

      let places
      try {
        places = await searchPlaces(niche.query, city, apiKey)
      } catch (err) {
        console.error(`Failed to search ${niche.query} in ${city}:`, err)
        continue
      }

      for (const place of places.slice(0, 5)) {
        if (totalInserted >= MAX_PER_RUN) break

        // Get full details
        let details
        try {
          details = await getPlaceDetails(place.place_id, apiKey)
        } catch {
          details = null
        }

        if (!details) continue

        const phone = details.formatted_phone_number?.replace(/\D/g, '') ?? null

        // Try to extract email from website (critical: outreach won't fire without it)
        let email: string | null = null
        if (details.website) {
          email = await extractEmailFromWebsite(details.website)
        }

        // Dedup check
        if (phone) {
          const { data: existing } = await supabase
            .from('leads')
            .select('id')
            .eq('phone', phone)
            .limit(1)
          if (existing && existing.length > 0) {
            totalSkipped++
            continue
          }
        }

        // Name + city dedup
        const cityShort = city.split(',')[0]
        const { data: nameExists } = await supabase
          .from('leads')
          .select('id')
          .ilike('company_name', details.name)
          .ilike('city', `%${cityShort}%`)
          .limit(1)
        if (nameExists && nameExists.length > 0) {
          totalSkipped++
          continue
        }

        const score = scoreLead(details, niche.tag)

        const { error } = await supabase.from('leads').insert({
          company_name: details.name,
          contact_name: null,
          email,
          phone: phone,
          website: details.website ?? null,
          city: cityShort,
          niche: niche.tag,
          rating: details.rating ?? null,
          review_count: details.user_ratings_total ?? 0,
          score,
          status: 'Lead',
          source: 'google_places',
          sequence_step: 0,
          notes: null,
          competitive_flag: false,
        })

        if (error) {
          console.error(`Failed to insert ${details.name}:`, error.message)
        } else {
          totalInserted++
          console.log(`  ✓ Added: ${details.name} (score: ${score}${email ? ', email found' : ', no email'})`)
        }

        // Rate limit: 1 request per 200ms
        await new Promise((r) => setTimeout(r, 200))
      }
    }
  }

  console.log(`\nDone. Inserted: ${totalInserted}, Skipped (dups): ${totalSkipped}`)
}

main().catch(async (err) => {
  console.error('Lead gen script failed:', err)
  await sendFailureAlert(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
