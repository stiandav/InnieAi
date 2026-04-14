export default function ProposalSuccessPage() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-cream text-2xl font-bold mb-3">Welcome to InnieAI!</h1>
        <p className="text-cream/50 text-sm mb-2">
          Payment received. You&apos;ll receive an email shortly with your onboarding link.
        </p>
        <p className="text-cream/30 text-xs">
          Questions? Reply to the email we sent you or reach out at hello@innieai.co
        </p>
      </div>
    </div>
  )
}
