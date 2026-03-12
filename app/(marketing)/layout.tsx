import type { Metadata } from 'next'
import { LandingNav } from '@/components/marketing/landing-nav'
import { Footer } from '@/components/marketing/footer'

export const metadata: Metadata = {
  title: {
    template: '%s | Unweighted',
    default: 'Unweighted — Calorie Tracking with Accountability',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-mesh-light dark:bg-mesh-dark">
      <LandingNav />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
