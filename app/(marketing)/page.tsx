import type { Metadata } from 'next'
import { HeroSection } from '@/components/marketing/hero-section'
import { ProblemSection } from '@/components/marketing/problem-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { HowItWorksSection } from '@/components/marketing/how-it-works-section'
import { TestimonialsSection } from '@/components/marketing/testimonials-section'
import { LandingPricingSection } from '@/components/marketing/landing-pricing-section'
import { FAQSection } from '@/components/marketing/faq-section'
import { FinalCTA } from '@/components/marketing/final-cta'

export const metadata: Metadata = {
  title: 'Unweighted — Calorie Tracking with Accountability',
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <LandingPricingSection />
      <FAQSection />
      <FinalCTA />
    </>
  )
}
