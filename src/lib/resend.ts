import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is required')
    _resend = new Resend(key)
  }
  return _resend
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  from,
  tags,
  unsubscribeUrl,
  replyTo,
}: {
  to: string
  subject: string
  text: string
  html?: string
  from?: string
  tags?: Array<{ name: string; value: string }>
  unsubscribeUrl?: string
  replyTo?: string
}): Promise<{ id: string } | null> {
  const resend = getResend()
  const fromAddr = from ?? process.env.RESEND_FROM_EMAIL ?? 'Stian from InnieAI <stian@innieai.co>'

  const headers: Record<string, string> = {}
  if (unsubscribeUrl) {
    headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
  }

  try {
    const result = await resend.emails.send({
      from: fromAddr,
      to,
      reply_to: replyTo ?? (process.env.OWNER_EMAIL || undefined),
      subject,
      text,
      html,
      tags,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    })
    return result.data
  } catch (err) {
    console.error('Failed to send email to', to, err)
    return null
  }
}

export async function sendOwnerAlert(subject: string, text: string) {
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) return
  await sendEmail({ to: ownerEmail, subject, text })
}
