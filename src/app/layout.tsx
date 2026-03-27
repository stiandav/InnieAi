import type { Metadata } from 'next'
import { Fraunces, DM_Sans, Inter } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'InnieAI — Your business runs. You don\'t have to.',
    template: '%s | InnieAI',
  },
  description:
    'InnieAI is an AI automation agency that generates leads, follows up with prospects, manages your reputation, and reports results — all on autopilot.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://innieai.co'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://innieai.co',
    siteName: 'InnieAI',
    title: 'InnieAI — Your business runs. You don\'t have to.',
    description:
      'AI automation for local businesses. Lead generation, follow-up sequences, reputation management, and weekly reporting — fully automated.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InnieAI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InnieAI — Your business runs. You don\'t have to.',
    description:
      'AI automation for local businesses. Lead generation, follow-up sequences, reputation management, and weekly reporting — fully automated.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
