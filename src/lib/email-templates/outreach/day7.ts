import type { Lead } from '@/types/database'

export function getDay7Email(lead: Lead, calcomLink: string): { subject: string; body: string } {
  const unsubLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/email/unsubscribe?token=${lead.id}`

  const body = `Quick one.

A ${lead.niche} similar to ${lead.company_name} was losing 60% of their leads to slow response times. Within 30 days of using InnieAI, they were booking 3x more calls from the exact same traffic.

No new ads. No new spend. Just faster, smarter follow-up.

If you have 15 minutes this week, I'd like to show you the same system: ${calcomLink}

---
Unsubscribe: ${unsubLink}`

  return {
    subject: `What happened when they stopped chasing leads manually`,
    body,
  }
}
