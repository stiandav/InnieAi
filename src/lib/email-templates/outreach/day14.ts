import type { Lead } from '@/types/database'

export function getDay14Email(lead: Lead, calcomLink: string): { subject: string; body: string } {
  const unsubLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/email/unsubscribe?token=${lead.id}`

  const body = `Hi,

I've reached out a few times without hearing back — so I'll assume the timing isn't right for ${lead.company_name}.

If that changes and you'd like to see how InnieAI automates lead gen and follow-up for ${lead.niche} businesses, you can book a 15-minute call here: ${calcomLink}

Take care,
The InnieAI Team

---
Unsubscribe: ${unsubLink}`

  return {
    subject: `Closing your file`,
    body,
  }
}
