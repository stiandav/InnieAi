import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAFAF7',
        surface: '#F2EEE6',
        ink: '#0F1110',
        muted: '#6B6760',
        brand: {
          DEFAULT: '#1A6B44',
          hover: '#155838',
          light: '#E8F3EC',
        },
        // Keep legacy aliases so admin/dashboard components don't break
        navy: {
          DEFAULT: '#0A0F1E',
          light: '#111827',
          muted: '#1E2A3B',
        },
        cream: {
          DEFAULT: '#F5F0E8',
          dark: '#EDE8E0',
        },
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          light: '#DBEAFE',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        // legacy
        inter: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.015em',
      },
    },
  },
  plugins: [],
}

export default config
