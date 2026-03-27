export function getUpsellEmail(params: {
  clientName: string
  company: string
  currentTier: string
  targetTier: string
  targetPrice: number
  calcomLink: string
  emailBody: string
}): { subject: string; text: string } {
  return {
    subject: `${params.company}: you're ready for more`,
    text: params.emailBody,
  }
}
