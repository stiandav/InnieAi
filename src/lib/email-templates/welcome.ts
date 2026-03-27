export function getWelcomeEmail(params: {
  clientName: string
  company: string
  tier: string
  onboardingUrl: string
}): { subject: string; html: string; text: string } {
  const subject = `Welcome to InnieAI — let's get you set up`

  const text = `Hi ${params.clientName},

Welcome to InnieAI! We're thrilled to have ${params.company} on board.

Your ${params.tier} plan is confirmed. Next step: complete your onboarding questionnaire so we can configure your automations.

It takes about 5 minutes:
${params.onboardingUrl}

Once you submit, we'll start building your automation stack. Expect to be fully live within 7–14 days.

If you have any questions, just reply to this email.

The InnieAI Team`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:sans-serif;background:#F5F0E8;padding:40px 20px;margin:0;">
<div style="max-width:560px;margin:0 auto;background:#0A0F1E;border-radius:16px;overflow:hidden;">
  <div style="background:#3B82F6;padding:32px 40px;">
    <h1 style="color:white;font-size:28px;margin:0;font-weight:700;">Welcome to InnieAI</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:16px;">Your business runs. You don't have to.</p>
  </div>
  <div style="padding:40px;">
    <p style="color:#F5F0E8;font-size:16px;line-height:1.6;margin:0 0 20px;">Hi ${params.clientName},</p>
    <p style="color:#9CA3AF;font-size:15px;line-height:1.6;margin:0 0 20px;">Welcome to InnieAI! Your <strong style="color:#F5F0E8;">${params.tier} plan</strong> is confirmed for ${params.company}.</p>
    <p style="color:#9CA3AF;font-size:15px;line-height:1.6;margin:0 0 28px;">The next step is to complete your onboarding questionnaire (5 minutes). This lets us configure your automations specifically for your business.</p>
    <a href="${params.onboardingUrl}" style="display:inline-block;background:#3B82F6;color:white;font-weight:600;font-size:15px;padding:14px 28px;border-radius:8px;text-decoration:none;margin-bottom:28px;">Complete Onboarding →</a>
    <p style="color:#6B7280;font-size:13px;line-height:1.6;border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;margin:0;">
      Questions? Reply to this email. We're here to help.<br>
      <strong style="color:#9CA3AF;">The InnieAI Team</strong>
    </p>
  </div>
</div>
</body>
</html>`

  return { subject, html, text }
}
