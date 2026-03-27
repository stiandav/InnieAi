import React from 'react'
import { Nav } from '@/components/marketing/Nav'
import { Hero } from '@/components/marketing/Hero'
import { TrustBar } from '@/components/marketing/TrustBar'
import { ResultsBar } from '@/components/marketing/ResultsBar'
import { Services } from '@/components/marketing/Services'
import { WhoItsFor } from '@/components/marketing/WhoItsFor'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { Pricing } from '@/components/marketing/Pricing'
import { Testimonials } from '@/components/marketing/Testimonials'
import { FAQ } from '@/components/marketing/FAQ'
import { PreFooterCTA } from '@/components/marketing/PreFooterCTA'
import { Footer } from '@/components/marketing/Footer'

export default function HomePage() {
  const calcomLink = process.env.CALCOM_LINK || process.env.NEXT_PUBLIC_CALCOM_LINK || '#'

  return (
    <main>
      <Nav />
      <Hero calcomLink={calcomLink} />
      <TrustBar />
      <ResultsBar />
      <Services />
      <WhoItsFor />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <PreFooterCTA calcomLink={calcomLink} />
      <Footer />
    </main>
  )
}
