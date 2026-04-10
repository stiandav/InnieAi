import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const { clientId, message } = await req.json() as { clientId: string; message: string }

  if (!clientId || !message?.trim()) {
    return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
  }

  if (message.length > 5000) {
    return NextResponse.json({ success: false, error: 'Message too long' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data: client } = await supabase
    .from('clients')
    .select('name, company, email')
    .eq('id', clientId)
    .single()

  if (!client) return NextResponse.json({ success: false }, { status: 404 })

  // Store ticket in DB so it appears in the admin support queue
  await supabase.from('support_tickets').insert({
    client_id: clientId,
    message,
    status: 'open',
  })

  const ownerEmail = process.env.OWNER_EMAIL
  if (ownerEmail) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://innieai.co'
    await sendEmail({
      to: ownerEmail,
      subject: `Support: ${client.company} sent a message`,
      text: `${client.name} at ${client.company} sent a support message:\n\n${message}\n\nClient email: ${client.email}\n\nView all tickets: ${baseUrl}/admin/support`,
    })
  }

  return NextResponse.json({ success: true })
}
