import type { Lead } from '@/types/database'

export function getDay1Email(lead: Lead, personalizedFirstLine: string, calcomLink: string): { subject: string; body: string } {
  const unsubLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/email/unsubscribe?token=${lead.id}`

  const body = `${personalizedFirstLine}

Most ${lead.niche} businesses in ${lead.city} are leaving leads on the table with slow follow-up. We fix that automatically.

InnieAI generates qualified leads daily and follows up with each one within 60 seconds — personalised to their business, no manual work from you.

Worth a 15-minute call to see if it's a fit?

Book here: ${calcomLink}

---
To stop receiving these emails: ${unsubLink}`

  return {
    subject: `Quick question about ${lead.company_name}`,
    body,
  }
}
