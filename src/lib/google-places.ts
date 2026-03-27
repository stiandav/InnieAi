interface PlaceResult {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  website?: string
  rating?: number
  user_ratings_total?: number
  opening_hours?: { open_now: boolean }
  photos?: Array<{ photo_reference: string }>
  vicinity?: string
}

interface PlacesSearchResult {
  results: Array<{
    place_id: string
    name: string
    vicinity: string
    rating?: number
    user_ratings_total?: number
    photos?: Array<{ photo_reference: string }>
  }>
  next_page_token?: string
}

export interface EnrichedLead {
  place_id: string
  company_name: string
  address: string
  phone: string | null
  website: string | null
  city: string
  niche: string
  rating: number | null
  review_count: number
  score: number
}

export async function searchPlaces(
  query: string,
  city: string,
  apiKey: string
): Promise<PlacesSearchResult['results']> {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    `${query} in ${city}`
  )}&key=${apiKey}&type=establishment`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Places API error: ${res.status}`)
  const data = (await res.json()) as PlacesSearchResult
  return data.results ?? []
}

export async function getPlaceDetails(
  placeId: string,
  apiKey: string
): Promise<PlaceResult | null> {
  const fields = 'place_id,name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours,photos'
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json() as { result?: PlaceResult }
  return data.result ?? null
}

export function scoreLead(place: PlaceResult, niche: string): number {
  let score = 0

  // Low rating = opportunity (high pain)
  if (place.rating !== undefined && place.rating < 4.0) score += 3

  // Few reviews = undermarketed
  const reviewCount = place.user_ratings_total ?? 0
  if (reviewCount < 20) score += 2

  // No website = needs digital help
  if (!place.website) score += 2

  // Category match (always true if we searched correctly)
  if (niche) score += 2

  // Has phone number = contactable
  if (place.formatted_phone_number) score += 1

  return Math.min(score, 10)
}

export function extractCity(address: string): string {
  // "123 Main St, San Diego, CA 92101, USA" → "San Diego"
  const parts = address.split(',')
  if (parts.length >= 2) return parts[parts.length - 3]?.trim() ?? address
  return address
}
