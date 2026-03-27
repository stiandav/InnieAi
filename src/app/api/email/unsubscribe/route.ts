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
      `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed — InnieAI</title>
<style>*{box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:#FAFAF7;color:#0F1110;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:1rem;}
.box{text-align:center;max-width:420px;background:#F2EEE6;border:1px solid rgba(15,17,16,0.08);border-radius:16px;padding:2.5rem;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
.logo{font-weight:700;font-size:1.2rem;margin-bottom:1.5rem;color:#0F1110;}.logo span{color:#1A6B44;}
h1{font-size:1.3rem;font-weight:700;margin:0 0 0.75rem;}p{color:#6B6760;font-size:0.9rem;line-height:1.6;margin:0;}</style>
</head><body><div class="box"><div class="logo">Innie<span>AI</span></div><h1>You've been unsubscribed.</h1><p>You won't receive any more emails from us. We're sorry to see you go.</p></div></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch {
    return new NextResponse('Something went wrong.', { status: 500 })
  }
}
