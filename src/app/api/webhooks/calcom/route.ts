/**
 * Cal.com booking webhook
 * Configure at: cal.com/settings/developer/webhooks
 * Events: BOOKING_CREATED
 * URL: https://innieai.co/api/webhooks/calcom
 *
 * What it does:
 * 1. Parses inbound booking from cal.com
 * 2. Looks up the prospect in the leads table by email
 * 3. Generates a Claude briefing doc with everything the closer needs
 * 4. Assigns the call round-robin to an active closer (if any configured)
 * 5. Emails the closer with the briefing
 * 6. Alerts the owner either way
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendEmail, sendOwnerAlert } from '@/lib/resend'
import { generateCloserBriefing } from '@/lib/anthropic'

type CalcomAttendee = {
  name: string
  email: string
  timeZone: string
}

type CalcomPayload = {
  uid: string
  title: string
  startTime: string
  endTime: string
  attendees: CalcomAttendee[]
  responses?: {
    name?: { value: string }
    email?: { value: string }
    company?: { value: string }
    notes?: { value: string }
    [key: string]: { value: string } | undefined
  }
}

type CalcomWebhookBody = {
  triggerEvent: string
  payload: CalcomPayload
}

export async function POST(req: NextRequest) {
  let body: CalcomWebhookBody
  try {
    body = await req.json() as CalcomWebhookBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only handle new bookings
  if (body.triggerEvent !== 'BOOKING_CREATED') {
    return NextResponse.json({ received: true })
  }

  const payload = body.payload
  const attendee = payload.attendees?.[0]
  if (!attendee?.email) {
    return NextResponse.json({ received: true })
  }

  const prospectName = attendee.name
  const prospectEmail = attendee.email
  const company = payload.responses?.company?.value ?? ''
  const customMessage = payload.responses?.notes?.value ?? ''

  // Format call time in a readable way
  const callTime = new Date(payload.startTime).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: attendee.timeZone,
  })

  const supabase = createServerClient()

  // Look up the prospect in leads by email
  const { data: lead } = await supabase
    .from('leads')
    .select('niche, city, rating, review_count, score, sequence_step')
    .eq('email', prospectEmail)
    .single()

  // Generate briefing with Claude
  let briefing = ''
  try {
    briefing = await generateCloserBriefing({
      prospectName,
      prospectEmail,
      company: company || prospectName,
      callTime,
      niche: lead?.niche ?? 'unknown',
      city: lead?.city ?? 'unknown',
      rating: lead?.rating ?? null,
      reviewCount: lead?.review_count ?? 0,
      score: lead?.score ?? 0,
      sequenceStep: lead?.sequence_step ?? 0,
      customMessage,
    })
  } catch (err) {
    console.error('Failed to generate briefing:', err)
    briefing = `[Briefing generation failed]\n\nProspect: ${prospectName} (${prospectEmail})\nCompany: ${company}\nCall time: ${callTime}`
  }

  // Round-robin assign to an active closer
  const { data: closers } = await supabase
    .from('closers')
    .select('id, name, email, calls_assigned, commission_pct')
    .eq('is_active', true)
    .order('calls_assigned', { ascending: true })
    .limit(1)

  const closer = closers?.[0] ?? null

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'
  const calcomLink = process.env.CALCOM_LINK ?? 'https://cal.com/innieai'

  if (closer) {
    // Increment their call count
    await supabase
      .from('closers')
      .update({ calls_assigned: closer.calls_assigned + 1 })
      .eq('id', closer.id)

    // Email the closer with full briefing
    const commission = closer.commission_pct
    await sendEmail({
      to: closer.email,
      subject: `Sales call: ${prospectName} @ ${callTime}`,
      text: `Hi ${closer.name},

You have a sales call assigned to you.

CALL DETAILS
Prospect: ${prospectName}
Company: ${company || 'N/A'}
Email: ${prospectEmail}
Time: ${callTime}

---
BRIEFING
${briefing}

---
HOW TO CLOSE
When the prospect is ready to move forward, generate a proposal at:
${baseUrl}/admin/proposals/new

Your commission: ${commission}% of the setup fee on close.
Questions? Reply to this email or check the admin dashboard.

Good luck!
InnieAI`,
    })

    await sendOwnerAlert(
      `📅 Call assigned to ${closer.name}: ${prospectName} @ ${callTime}`,
      `${prospectName} (${prospectEmail}) booked a call.\n\nAssigned to: ${closer.name} (${closer.email})\nCall time: ${callTime}\nCompany: ${company || 'N/A'}\n\nBriefing sent to closer.`
    )
  } else {
    // No closers configured — alert owner to take the call themselves
    await sendOwnerAlert(
      `📅 New call booked: ${prospectName} @ ${callTime}`,
      `${prospectName} (${prospectEmail}) booked a call.\n\nCompany: ${company || 'N/A'}\nCall time: ${callTime}\n\nNo closers configured — you'll need to take this one.\n\nTip: Add closers at ${baseUrl}/admin/closers to auto-assign future calls.\n\n---\nBRIEFING\n${briefing}\n\nCal.com: ${calcomLink}`
    )
  }

  return NextResponse.json({ received: true })
}
