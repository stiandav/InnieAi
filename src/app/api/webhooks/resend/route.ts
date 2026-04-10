/**
 * Resend email event webhook
 * Configure at: resend.com/webhooks → add endpoint
 * URL: https://innieai.co/api/webhooks/resend
 * Events to enable: email.bounced, email.complained
 *
 * email.bounced  → marks sequence bounced=true, marks lead Invalid
 * email.complained → treats as unsubscribe (spam complaint = never email again)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

type ResendEvent = {
  type: 'email.bounced' | 'email.complained' | 'email.delivered' | 'email.opened' | string
  data: {
    email_id: string
    to: string[]
    created_at: string
  }
}

export async function POST(req: NextRequest) {
  let event: ResendEvent
  try {
    event = await req.json() as ResendEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const resendId = event.data?.email_id
  if (!resendId) return NextResponse.json({ received: true })

  const supabase = createServerClient()

  if (event.type === 'email.bounced') {
    // Mark the sequence record as bounced
    const { data: seq } = await supabase
      .from('email_sequences')
      .update({ bounced: true })
      .eq('resend_id', resendId)
      .select('lead_id')
      .single()

    // Mark the lead Invalid so we stop emailing them
    if (seq?.lead_id) {
      await supabase
        .from('leads')
        .update({ status: 'Invalid', notes: 'Email bounced' })
        .eq('id', seq.lead_id)
    }
  }

  if (event.type === 'email.complained') {
    // Spam complaint — treat same as unsubscribe: never email again
    const { data: seq } = await supabase
      .from('email_sequences')
      .update({ unsubscribed: true })
      .eq('resend_id', resendId)
      .select('lead_id')
      .single()

    if (seq?.lead_id) {
      // Mark all their sequences unsubscribed
      await supabase
        .from('email_sequences')
        .update({ unsubscribed: true })
        .eq('lead_id', seq.lead_id)

      await supabase
        .from('leads')
        .update({ status: 'Invalid', notes: 'Spam complaint' })
        .eq('id', seq.lead_id)
    }
  }

  return NextResponse.json({ received: true })
}
