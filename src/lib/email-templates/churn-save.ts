export function getChurnSaveEmail(params: {
  clientName: string
  company: string
  calcomLink: string
  subject: string
  body: string
}): { subject: string; text: string } {
  return {
    subject: params.subject || `Checking in — everything okay at ${params.company}?`,
    text: params.body,
  }
}
