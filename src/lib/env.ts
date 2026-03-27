const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'ANTHROPIC_API_KEY',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_STARTER_MONTHLY_PRICE_ID',
  'STRIPE_GROWTH_MONTHLY_PRICE_ID',
  'STRIPE_SCALE_MONTHLY_PRICE_ID',
  'STRIPE_STARTER_SETUP_PRICE_ID',
  'STRIPE_GROWTH_SETUP_PRICE_ID',
  'STRIPE_SCALE_SETUP_PRICE_ID',
  'GOOGLE_PLACES_API_KEY',
  'OWNER_EMAIL',
  'NEXT_PUBLIC_BASE_URL',
  'CALCOM_LINK',
] as const

type EnvKey = (typeof required)[number]

function getEnv(key: EnvKey): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  supabaseUrl: getEnv('SUPABASE_URL'),
  supabaseAnonKey: getEnv('SUPABASE_ANON_KEY'),
  supabaseServiceKey: getEnv('SUPABASE_SERVICE_KEY'),
  anthropicApiKey: getEnv('ANTHROPIC_API_KEY'),
  resendApiKey: getEnv('RESEND_API_KEY'),
  resendFromEmail: getEnv('RESEND_FROM_EMAIL'),
  stripeSecretKey: getEnv('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),
  stripeStarterMonthlyPriceId: getEnv('STRIPE_STARTER_MONTHLY_PRICE_ID'),
  stripeGrowthMonthlyPriceId: getEnv('STRIPE_GROWTH_MONTHLY_PRICE_ID'),
  stripeScaleMonthlyPriceId: getEnv('STRIPE_SCALE_MONTHLY_PRICE_ID'),
  stripeStarterSetupPriceId: getEnv('STRIPE_STARTER_SETUP_PRICE_ID'),
  stripeGrowthSetupPriceId: getEnv('STRIPE_GROWTH_SETUP_PRICE_ID'),
  stripeScaleSetupPriceId: getEnv('STRIPE_SCALE_SETUP_PRICE_ID'),
  googlePlacesApiKey: getEnv('GOOGLE_PLACES_API_KEY'),
  ownerEmail: getEnv('OWNER_EMAIL'),
  baseUrl: getEnv('NEXT_PUBLIC_BASE_URL'),
  calcomLink: getEnv('CALCOM_LINK'),
} as const

export function checkEnv(): { key: string; present: boolean }[] {
  return required.map((key) => ({
    key,
    present: !!process.env[key],
  }))
}
