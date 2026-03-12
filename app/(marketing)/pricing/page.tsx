import type { Metadata } from 'next'
import { LandingPricingSection } from '@/components/marketing/landing-pricing-section'
import { FAQSection } from '@/components/marketing/faq-section'

export const metadata: Metadata = {
  title: 'Pricing',
}

export default function PricingPage() {
  return (
    <div className="pt-16">
      <div className="mx-auto max-w-3xl px-4 pt-12 text-center lg:px-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber">
          Plans & Pricing
        </p>
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
          Choose the plan that fits your{' '}
          <span className="text-gradient-brand">journey</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free and upgrade as you grow. No hidden fees, cancel anytime.
        </p>
      </div>
      <LandingPricingSection />
      <FAQSection />
    </div>
  )
}
