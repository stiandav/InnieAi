/**
 * InnieAI Lead Generation Script
 * Run: npx tsx scripts/lead-gen.ts
 * GitHub Action: daily-lead-gen.yml (7am PST daily)
 *
 * Self-improving: queries historical conversion data to prioritize
 * niches and cities that have produced the most engaged/converted leads.
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
// Fallback niche/city config — overridden by the settings table at runtime.
// The settings table is populated automatically when clients onboard.
const FALLBACK_NICHES: { query: string; tag: string }[] = [
  { query: 'dental office', tag: 'dental' },
  { query: 'medical spa', tag: 'medspa' },
  { query: 'gym fitness studio', tag: 'gym' },
  { query: 'general contractor', tag: 'contractor' },
  { query: 'real estate agent', tag: 'real-estate' },
  { query: 'law firm', tag: 'law' },
]

// Map niche tag → Google Places search query
const NICHE_QUERY_MAP: Record<string, string> = {
  dental: 'dental office',
  medspa: 'medical spa',
  gym: 'gym fitness studio',
  contractor: 'general contractor',
  'real-estate': 'real estate agent',
  law: 'law firm',
  chiropractic: 'chiropractic office',
  physio: 'physical therapy clinic',
  accounting: 'accounting firm',
  vet: 'veterinary clinic',
  insurance: 'insurance agency',
  'auto-repair': 'auto repair shop',
  'marketing-agency': 'marketing agency',
  finance: 'financial advisor',
}

const FALLBACK_CITIES = [
  'San Diego, CA',
  'Los Angeles, CA',
  'Phoenix, AZ',
  'Las Vegas, NV',
  'Denver, CO',
]

const MAX_PER_RUN = 100
// =======================================================

/**
 * Loads active niches and cities from the settings table (populated by onboarding
 * and growth engine), then sorts by historical conversion rate.
 */
async function getSortedTargets(supabase: ReturnType<typeof createScriptClient>) {
  try {
    // Read live targets from settings table — updated automatically when clients onboard
    const [{ data: nicheRow }, { data: cityRow }] = await Promise.all([
      supabase.from('settings').select('value').eq('key', 'base_niches').single(),
      supabase.from('settings').select('value').eq('key', 'base_cities').single(),
    ])

    const activeNicheTags = (nicheRow?.value ?? '')
      .split(',').map((n: string) => n.trim()).filter(Boolean)
    const activeCities = (cityRow?.value ?? '')
      .split(',').map((c: string) => c.trim()).filter(Boolean)

    // Build niche objects from tags — fall back to hardcoded list if settings empty
    const baseNiches = activeNicheTags.length > 0
      ? activeNicheTags.map((tag: string) => ({
          query: NICHE_QUERY_MAP[tag] ?? tag.replace(/-/g, ' '),
          tag,
        }))
      : FALLBACK_NICHES

    const baseCities = activeCities.length > 0 ? activeCities : FALLBACK_CITIES

    const { data: leads } = await supabase
      .from('leads')
      .select('niche, city, status, sequence_step')
      .not('email', 'is', null)

    if (!leads || leads.length < 50) {
      return { niches: baseNiches, cities: baseCities }
    }

    // Score niches: weight by (replies + conversions) / total leads
    const nicheStats = new Map<string, { total: number; engaged: number }>()
    const cityStats = new Map<string, { total: number; engaged: number }>()

    for (const lead of leads) {
      const engaged = lead.status === 'Active Client' || lead.status === 'Closed Won' || lead.sequence_step >= 2

      const ns = nicheStats.get(lead.niche) ?? { total: 0, engaged: 0 }
      ns.total++
      if (engaged) ns.engaged++
      nicheStats.set(lead.niche, ns)

      const cityShort = (lead.city ?? '').split(',')[0].trim()
      const cs = cityStats.get(cityShort) ?? { total: 0, engaged: 0 }
      cs.total++
      if (engaged) cs.engaged++
      cityStats.set(cityShort, cs)
    }

    const nicheScores = baseNiches.map((n: { query: string; tag: string }) => {
      const stats = nicheStats.get(n.tag)
      const rate = stats && stats.total >= 5 ? stats.engaged / stats.total : 0.5
      return { ...n, rate }
    })
    nicheScores.sort((a: { rate: number }, b: { rate: number }) => b.rate - a.rate)

    const cityScores = baseCities.map((c: string) => {
      const cityShort = c.split(',')[0].trim()
      const stats = cityStats.get(cityShort)
      const rate = stats && stats.total >= 5 ? stats.engaged / stats.total : 0.5
      return { city: c, rate }
    })
    cityScores.sort((a: { rate: number }, b: { rate: number }) => b.rate - a.rate)

    const topNiche = nicheScores[0]
    const topCity = cityScores[0]
    if (topNiche.rate > 0.5) {
      console.log(`Top performing niche: ${topNiche.tag} (${(topNiche.rate * 100).toFixed(1)}% engagement)`)
    }
    if (topCity.rate > 0.5) {
      console.log(`Top performing city: ${topCity.city} (${(topCity.rate * 100).toFixed(1)}% engagement)`)
    }

    return {
      niches: nicheScores,
      cities: cityScores.map((c: { city: string }) => c.city),
    }
  } catch {
    return { niches: FALLBACK_NICHES, cities: FALLBACK_CITIES }
  }
}

async function sendFailureAlert(error: string) {
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) return
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'hello@innieai.co',
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

  // Self-improving: get targets ordered by historical performance
  const { niches, cities } = await getSortedTargets(supabase)

  for (const city of cities) {
    for (const niche of niches) {
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

        let details
        try {
          details = await getPlaceDetails(place.place_id, apiKey)
        } catch {
          details = null
        }

        if (!details) continue

        const phone = details.formatted_phone_number?.replace(/\D/g, '') ?? null

        let email: string | null = null
        if (details.website) {
          email = await extractEmailFromWebsite(details.website)
        }

        // Dedup by phone
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

        // Dedup by name + city
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
          phone,
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
