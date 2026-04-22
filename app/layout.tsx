import type { Metadata, Viewport } from 'next'
import { Great_Vibes, Montserrat, Playfair_Display } from 'next/font/google'
import '@/styles/globals.css'
import { negocio } from '@/app/lib/data'

// ─── Fonts ────────────────────────────────────────────────────────────────────

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
})

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: `${negocio.nome} — ${negocio.tagline}`,
    template: `%s | ${negocio.nome}`,
  },
  description:
    'Bar do Bruce: gastronomia baiana com sofisticação moderna no Pelourinho, Salvador. Reservas, cardápio interativo e ambiente premium.',
  keywords: [
    'bar salvador',
    'restaurante pelourinho',
    'gastronomia baiana',
    'bar do bruce',
    'reservas salvador',
    'comida baiana',
  ],
  openGraph: {
    title: `${negocio.nome} — ${negocio.tagline}`,
    description: 'Uma experiência gastronômica única em Salvador, Bahia.',
    siteName: negocio.nome,
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#121212',
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${greatVibes.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  )
}
