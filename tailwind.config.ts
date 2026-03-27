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
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-navy': 'linear-gradient(135deg, #0A0F1E 0%, #111827 100%)',
        'gradient-accent': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      },
    },
  },
  plugins: [],
}

export default config
