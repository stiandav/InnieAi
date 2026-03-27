import React from 'react'
import { Nav } from '@/components/marketing/Nav'
import { Hero } from '@/components/marketing/Hero'
import { Services } from '@/components/marketing/Services'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { Pricing } from '@/components/marketing/Pricing'
import { Testimonials } from '@/components/marketing/Testimonials'
import { FAQ } from '@/components/marketing/FAQ'
import { Footer } from '@/components/marketing/Footer'

export default function HomePage() {
  const calcomLink = process.env.CALCOM_LINK || process.env.NEXT_PUBLIC_CALCOM_LINK || '#'

  return (
    <main>
      <Nav />
      <Hero calcomLink={calcomLink} />
      <Services />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  )
}
