import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/lib/providers/providers'
import { PWARegister } from '@/components/pwa/pwa-register'
import { PWAInstallPrompt } from '@/components/pwa/pwa-install-prompt'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#0D0D1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://unweighted.app'),
  title: {
    default: 'Unweighted — Weight Loss With Accountability',
    template: '%s | Unweighted',
  },
  description:
    'The only calorie tracker that keeps you accountable. Track food, join a group, transform together.',
  keywords: [
    'calorie tracker',
    'weight loss',
    'accountability',
    'macro tracking',
    'food diary',
    'diet app',
    'accountability group',
    'weight loss app',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Unweighted',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-body antialiased`}
      >
        <Providers>{children}</Providers>
        <PWARegister />
        <PWAInstallPrompt />
      </body>
    </html>
  )
}
