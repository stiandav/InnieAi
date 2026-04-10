/**
 * Inbound Email Webhook
 * POST /api/webhooks/resend-inbound
 *
 * Cloudflare Email Routing catches reply+{seqId}@innieai.co and forwards here.
 * We mark the sequence as replied and stop further emails to that lead.
 *
 * One-time setup (free, ~2 minutes):
 *  1. Cloudflare dashboard → your innieai.co zone → Email → Email Routing
 *  2. Enable Email Routing (adds MX records automatically)
 *  3. Catch-all address → Action: "Send to Worker"
 *  4. Create a Worker with this code:
 *
 *     export default {
 *       async email(message, env) {
 *         const raw = await new Response(message.raw).text()
 *         // Extract plain-text body (everything after the first blank line in the raw email)
 *         const bodyStart = raw.indexOf('\r\n\r\n')
 *         const body = bodyStart !== -1 ? raw.slice(bodyStart + 4) : ''
 *         await fetch('https://innieai.co/api/webhooks/resend-inbound', {
 *           method: 'POST',
 *           headers: { 'Content-Type': 'application/json' },
 *           body: JSON.stringify({
 *             to: message.to,
 *             from: message.from,
 *             subject: message.headers.get('subject') ?? '',
 *             text: body,
 *           }),
 *         })
 *       }
 *     }
 *
 *  That's it. Cloudflare handles MX records. No paid plan needed.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { generateSalesReply } from '@/lib/anthropic'

const CALCOM_LINK = process.env.CALCOM_LINK ?? 'https://cal.com/innieai'
const SENDER_NAME = process.env.SENDER_NAME ?? 'Alex'

// Max auto-replies per lead before escalating to owner (avoids infinite loops)
const MAX_AUTO_REPLIES = 3

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      to?: string | Array<{ email: string; name?: string }>
      from?: string
      subject?: string
      text?: string
    }

    // Extract the `to` address
    let toAddress: string | undefined
    if (typeof body.to === 'string') {
      toAddress = body.to
    } else if (Array.isArray(body.to) && body.to.length > 0) {
      toAddress = body.to[0].email
    }

    if (!toAddress) return NextResponse.json({ ok: true })

    // reply+{seqId}@innieai.co — extract seqId
    const match = toAddress.match(/^reply\+([a-f0-9-]+)@innieai\.co$/i)
    if (!match) return NextResponse.json({ ok: true }) // not our format

    const seqId = match[1]
    const prospectEmail = typeof body.from === 'string' ? body.from : ''
    const prospectMessage = (body.text ?? '').slice(0, 2000).trim()
    const supabase = createServerClient()

    // Mark this sequence as replied and get the lead
    const { data: seq } = await supabase
      .from('email_sequences')
      .update({ replied: true })
      .eq('id', seqId)
      .select('lead_id')
      .single()

    if (!seq?.lead_id) return NextResponse.json({ ok: true })

    // Stop all scheduled outreach for this lead
    await supabase.from('leads').update({ status: 'Replied' }).eq('id', seq.lead_id)

    if (!prospectMessage) return NextResponse.json({ ok: true })

    // Load lead info
    const { data: lead } = await supabase
      .from('leads')
      .select('company_name, contact_name, niche, city, auto_reply_count')
      .eq('id', seq.lead_id)
      .single()

    if (!lead) return NextResponse.json({ ok: true })

    const autoReplyCount: number = (lead as { auto_reply_count?: number }).auto_reply_count ?? 0

    if (autoReplyCount >= MAX_AUTO_REPLIES) {
      // Hand off to owner — prospect is engaged but needs a human
      const ownerEmail = process.env.OWNER_EMAIL
      if (ownerEmail) {
        await sendEmail({
          to: ownerEmail,
          subject: `🔥 Hot lead needs you: ${lead.company_name}`,
          text: `${lead.company_name} (${lead.niche}, ${lead.city}) has replied ${autoReplyCount + 1} times to your outreach — they're engaged and need a personal touch.

Their latest message:
"${prospectMessage}"

Their email: ${prospectEmail}

Reply directly to them: ${prospectEmail}
Or book a call and send them: ${CALCOM_LINK}`,
        })
      }
      return NextResponse.json({ ok: true })
    }

    // Load previous emails sent to this lead for context
    const { data: prevEmails } = await supabase
      .from('email_sequences')
      .select('subject, body')
      .eq('lead_id', seq.lead_id)
      .not('sent_at', 'is', null)
      .order('step', { ascending: true })

    // Generate a reply with Claude
    const { reply, intent } = await generateSalesReply({
      prospectName: lead.contact_name ?? lead.company_name,
      company: lead.company_name,
      niche: lead.niche,
      city: lead.city,
      prospectMessage,
      previousEmails: (prevEmails ?? []).map((e) => ({ subject: e.subject, body: e.body })),
      calcomLink: CALCOM_LINK,
      senderName: SENDER_NAME,
    })

    if (intent === 'not_interested' || intent === 'unsubscribe') {
      // Mark lead invalid and unsubscribe all sequences — don't reply
      await supabase.from('leads').update({ status: 'Invalid' }).eq('id', seq.lead_id)
      await supabase.from('email_sequences').update({ unsubscribed: true }).eq('lead_id', seq.lead_id)
      return NextResponse.json({ ok: true })
    }

    // Send the auto-reply from the owner's email address
    const fromAddr = process.env.RESEND_FROM_EMAIL ?? `${SENDER_NAME} from InnieAI <hello@innieai.co>`
    const replySubject = body.subject?.startsWith('Re:') ? (body.subject ?? '') : `Re: ${body.subject ?? ''}`

    await sendEmail({
      to: prospectEmail,
      subject: replySubject,
      text: reply,
      from: fromAddr,
    })

    // Increment auto_reply_count on the lead
    await supabase
      .from('leads')
      .update({ auto_reply_count: autoReplyCount + 1 } as Record<string, unknown>)
      .eq('id', seq.lead_id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('resend-inbound webhook error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
