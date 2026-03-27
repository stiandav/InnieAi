import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return new NextResponse('Invalid unsubscribe link.', { status: 400 })
  }

  try {
    const supabase = createServerClient()

    // Token is the lead_id
    await supabase
      .from('email_sequences')
      .update({ unsubscribed: true })
      .eq('lead_id', token)

    await supabase
      .from('leads')
      .update({ status: 'Invalid', notes: 'Unsubscribed via email link' })
      .eq('id', token)

    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title>
<style>body{font-family:sans-serif;background:#0A0F1E;color:#F5F0E8;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}
.box{text-align:center;max-width:400px;padding:2rem;}h1{font-size:1.5rem;margin-bottom:1rem;}p{color:#9CA3AF;}</style>
</head><body><div class="box"><h1>You've been unsubscribed.</h1><p>You won't receive any more emails from InnieAI. We're sorry to see you go.</p></div></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch {
    return new NextResponse('Something went wrong.', { status: 500 })
  }
}
