import type { Lead } from '@/types/database'

export function getDay3Email(lead: Lead, nicheInsight: string, calcomLink: string): { subject: string; body: string } {
  const unsubLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/email/unsubscribe?token=${lead.id}`

  const insight = nicheInsight?.trim()
    || `Most ${lead.niche} businesses in ${lead.city} lose more than half their leads to slow follow-up — and never know it.`

  const body = `${insight}

The businesses that win in ${lead.niche} right now respond faster and follow up longer than their competitors.

InnieAI handles both — automatically, without any work from you.

I can show you exactly what this looks like for a ${lead.niche} in ${lead.city} in 15 minutes.

${calcomLink}

---
To unsubscribe: ${unsubLink}`

  return {
    subject: `What I found looking at ${lead.niche} businesses in ${lead.city}`,
    body,
  }
}
