import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
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

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
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
  themeColor: '#0A0A0A',
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
